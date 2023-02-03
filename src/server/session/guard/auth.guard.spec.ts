import * as secureSession from '@fastify/secure-session';
import { Controller, Delete, Get, Post, Request } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule, Query, Resolver } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import gql from 'graphql-tag';
import supertest from 'supertest';
import request from 'supertest-graphql';

import { TestDbModule } from '../../common/test-db.module';
import { login } from '../../common/test-graphql/login';
import { ConfigTestModule } from '../../core/config/config.test';
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
}

@Resolver()
export class TestGuardResolver {
    @Query(() => String, {})
    test(): string {
        return 'Allowed';
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
                    context: (req: { session: secureSession.Session }) => ({
                        session: req.session,
                    }),
                }),
            ],
            providers: [
                {
                    provide: APP_GUARD,
                    useClass: AuthGuard,
                },
                TestGuardResolver,
            ],
            controllers: [TestGuardController],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

        app.register(require('@fastify/secure-session'), {
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

    afterEach(() => {
        app.close();
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

        beforeEach(async () => {
            await app.get(UserProfileService).addUser('demo', 'demo', { isActive: true });

            const r = await request(server).query(login, { credentials: { username: 'demo', password: 'demo' } });
            cookies = r.response.headers['set-cookie'];
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
    });
});
