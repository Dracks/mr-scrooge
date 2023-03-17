/* eslint-disable class-methods-use-this */
import { Controller, Get, Post } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule, Int, Query, Resolver } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import gql from 'graphql-tag';
import supertest from 'supertest';
import request from 'supertest-graphql';

import { TestDbModule } from '../../common/test-db.module';
import { login } from '../../common/test-graphql/login';
import { WebSession } from '../../common/web-session.type';
import { ConfigTestModule } from '../../core/config/config.test';
import { GqlGroupsId } from '../decorators/gql-groups-id';
import { GroupsId } from '../decorators/groups-id';
import { AuthInterceptor } from '../interceptor/auth.interceptor';
import { UserProfileService } from '../services/user-profile.service';
import { SessionModule } from '../session.module';
import { AuthGuard } from './auth.guard';
import { AllowRoles, Role } from './roles.decorator';

@Controller('test-controller')
class TestGuardController {
    @Get('/')
    @AllowRoles(Role.GUEST)
    index(): string {
        return 'Allowed';
    }

    @Post('/')
    update(): string {
        return 'Allowed';
    }

    @Get('/admin')
    @AllowRoles(Role.ADMIN)
    admin(): string {
        return 'Allowed';
    }

    @Get('/getGroups')
    getGroups(@GroupsId() groupsId: number[]): number[] {
        return groupsId;
    }
}

@Resolver()
export class TestGuardResolver {
    @Query(() => String, {})
    test(): string {
        return 'Allowed';
    }

    @Query(()=> [Int], {name: 'groups'})
    getGroups(@GqlGroupsId() groupsId: number[]){
        return groupsId;
    }
}


describe(AuthGuard.name, () => {
    let app!: NestFastifyApplication;
    let server!: FastifyInstance;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TestDbModule,
                SessionModule,
                ConfigTestModule,
                GraphQLModule.forRoot<MercuriusDriverConfig>({
                    driver: MercuriusDriver,
                    graphiql: false,
                    autoSchemaFile: `/tmp/mr-scrooge-tests/${Math.random()}.gql`,
                    context: (req: unknown) => {
                        const { session, groupsId} = req as {groupsId: number[], session: WebSession}
                        return {
                        session,
                        groups: groupsId
                    }},
                }),
            ],
            providers: [
                {
                    provide: APP_GUARD,
                    useClass: AuthGuard,
                },
                {
                    provide: APP_INTERCEPTOR,
                    useClass: AuthInterceptor,
                },
                TestGuardResolver,
            ],
            controllers: [TestGuardController],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        await app.register(require('@fastify/secure-session'), {
            secret: 'averylogphrasebiggerthanthirtytwochars',
            salt: 'mq9hDxBVDbspDR6n',
            cookie: {
                path: '/',
            },
        });
        
        await app.init();
        await app.getHttpAdapter().getInstance().ready();

        server = app.getHttpAdapter().getHttpServer();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('Guest', () => {
        it('Access allowed', async () => {
            await supertest(server).get('/test-controller').expect(200);
        });

        it('Access not allowed', async () => {
            await supertest(server).post('/test-controller').expect(403);
            await supertest(server).get('/test-controller/admin').expect(403);

            const response = await request(server).query(
                gql`
                    query {
                        test
                    }
                `,
            );
            expect(response.errors).toContainEqual(
                expect.objectContaining({
                    message: 'Forbidden resource',
                }),
            );
        });
    });

    describe('Normal user', () => {
        let cookies: string[];
        let userId: number;

        beforeEach(async () => {
            const user = await app.get(UserProfileService).addUser('demo', 'demo', { isActive: true });
            userId = user.id

            const loginResponse = await request(server).query(login, { credentials: { username: 'demo', password: 'demo' } });
            cookies = loginResponse.response.headers['set-cookie'];
        });

        it('Access allowed', async () => {
            await supertest(server)
                .post('/test-controller')
                .set('Cookie', [...cookies])
                .expect(201);
        });

        it('Still admin is not allowed', async () => {
            await supertest(server)
                .get('/test-controller/admin')
                .set('Cookie', [...cookies])
                .expect(403);
        });

        describe('testing auth middleware getGroups', ()=>{
            beforeEach(async () => {
                await app.get(UserProfileService).addUser('demo2', 'demo')
                await app.get(UserProfileService).addGroup(userId, 'testing3')
            });

            it('api rest works fine', async ()=>{
                const response = await supertest(server)
                .get('/test-controller/getGroups')
                .set('Cookie', [...cookies])
                .expect(200);
                expect(response.body).toEqual([1,3])
            })

            it('api rest works fine', async ()=>{
                const response = await request(server).query(
                    gql`
                        query {
                            groups
                        }
                    `,
                )
                .set('Cookie', [...cookies])
                
                expect(response.data).toEqual({groups: [1,3]})
            })
        })
    });

});
