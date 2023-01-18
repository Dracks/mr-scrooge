import * as secureSession from '@fastify/secure-session';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import gql from 'graphql-tag';
import request from 'supertest-graphql';

import { TestDbModule } from '../../common/test-db.module';
import { mockPartial } from '../../common/test-tools/mock-partial';
import { ConfigTestModule } from '../../core/config/config.test';
import { MyLoggerModule } from '../../core/logger.module';
import { UserEntity } from '../entities/user.entity';
import { AuthGuard } from '../guard/auth.guard';
import { UserProfileService } from '../services/user-profile.service';
import { SessionModule } from '../session.module';
import { LoginArgs, SessionResolver } from './session.resolver';

const myProfile = gql`
    query {
        me {
            __typename
        }
    }
`;

const login = gql`
    mutation login($credentials: LoginArgs!) {
        login(credentials: $credentials) {
            __typename
        }
    }
`;

describe(SessionResolver.name, () => {
    let app!: NestFastifyApplication;
    let session!: jest.Mocked<secureSession.Session>;
    let server!: FastifyInstance;

    beforeEach(async () => {
        session = mockPartial<jest.Mocked<secureSession.Session>>({
            get: jest.fn(),
            set: jest.fn(),
        });
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TestDbModule,
                ConfigTestModule,
                GraphQLModule.forRoot<MercuriusDriverConfig>({
                    driver: MercuriusDriver,
                    graphiql: 'graphiql',
                    autoSchemaFile: `/tmp/mr-scrooge-tests/${Math.random()}.gql`,
                    context: () => ({
                        session,
                    }),
                }),
                MyLoggerModule,
                SessionModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        server = app.getHttpAdapter().getHttpServer();
    });

    afterEach(() => {
        app.close();
    });

    it('Starts the service', () => {
        expect(app).toBeTruthy();
    });

    describe('query MyProfile me', () => {
        let user!: UserEntity;

        beforeEach(async () => {
            const profileService = app.get(UserProfileService);
            user = await profileService.addUser('test-user', 'test-user1', { isActive: true });
        });

        it('When we are not identified, it returns invalid', async () => {
            const { data } = await request<{ me: { __typename: string } }>(server).query(myProfile).expectNoErrors();
            expect(data?.me.__typename).toEqual('NotIdentified');
        });

        it('When we are identified we recover the profile', async () => {
            session.get.mockReturnValue(user.id);

            const { data } = await request<{ me: { __typename: string } }>(server).query(myProfile).expectNoErrors();

            expect(data?.me).toEqual({
                __typename: 'MyProfile',
            });
        });
    });

    describe('mutation Login', () => {
        let userValid!: UserEntity;
        let userDisabled!: UserEntity;

        beforeEach(async () => {
            const profileService = app.get(UserProfileService);
            userValid = await profileService.addUser('test-user1', 'test-user1', {
                isActive: true,
                email: 'my@email.com',
            });

            userDisabled = await profileService.addUser('test-user2', 'test-user2', { isActive: false });
        });

        it('login correctly with username', async () => {
            const { data, errors } = await request<{ login: { __typename: string } }, { credentials: LoginArgs }>(
                server,
            ).query(login, { credentials: { username: 'test-user1', password: 'test-user1' } });
            expect(errors).toBeUndefined();
            expect(data).toEqual({ login: { __typename: 'MyProfile' } });
            expect(session.set).toBeCalledTimes(1);
        });

        it('login correctly with email', async () => {
            const { data, errors } = await request<{ login: { __typename: string } }, { credentials: LoginArgs }>(
                server,
            ).query(login, { credentials: { username: userValid.email, password: 'test-user1' } });
            expect(errors).toBeUndefined();
            expect(data).toEqual({ login: { __typename: 'MyProfile' } });
            expect(session.set).toBeCalledTimes(1);
        });

        it('login inactive username', async () => {
            const { data, errors } = await request<{ login: { __typename: string } }, { credentials: LoginArgs }>(
                server,
            ).query(login, { credentials: { username: 'test-user2', password: 'test-user2' } });
            expect(errors).toBeUndefined();
            expect(data).toEqual({ login: { __typename: 'InvalidCredentials' } });
            expect(session.set).toBeCalledTimes(0);
        });
    });
});
