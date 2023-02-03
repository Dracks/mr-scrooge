import * as secureSession from '@fastify/secure-session';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import request from 'supertest-graphql';

import { TestDbModule } from '../../common/test-db.module';
import { myProfile } from '../../common/test-graphql/get-my-profile';
import { getGraphQLTestModule } from '../../common/test-graphql/graph-ql.module';
import { login } from '../../common/test-graphql/login';
import { mockPartial } from '../../common/test-tools/mock-partial';
import { MyLoggerModule } from '../../core/logger.module';
import { IUserModel } from '../models/user.model';
import { UserProfileService } from '../services/user-profile.service';
import { SessionModule } from '../session.module';
import { LoginArgs, SessionResolver } from './session.resolver';

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
            imports: [TestDbModule, getGraphQLTestModule(() => ({ session })), MyLoggerModule, SessionModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        server = app.getHttpAdapter().getHttpServer();
    });

    afterEach(async () => {
        await app.close();
    });

    it('Starts the service', () => {
        expect(app).toBeTruthy();
    });

    describe('query MyProfile me', () => {
        let user!: IUserModel;

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
        let userValid!: IUserModel;
        let userDisabled!: IUserModel;

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
            expect(session.set).toBeCalledTimes(2);
        });

        it('login correctly with email', async () => {
            const { data, errors } = await request<{ login: { __typename: string } }, { credentials: LoginArgs }>(
                server,
            ).query(login, { credentials: { username: userValid.email, password: 'test-user1' } });
            expect(errors).toBeUndefined();
            expect(data).toEqual({ login: { __typename: 'MyProfile' } });
            expect(session.set).toBeCalledTimes(2);
            expect(session.set).toBeCalledWith('userId', expect.anything());
            expect(session.set).toBeCalledWith('sessionId', expect.anything());
        });

        it('login inactive username', async () => {
            const { data, errors } = await request<{ login: { __typename: string } }, { credentials: LoginArgs }>(
                server,
            ).query(login, { credentials: { username: userDisabled.username, password: 'test-user2' } });
            expect(errors).toBeUndefined();
            expect(data).toEqual({ login: { __typename: 'InvalidCredentials' } });
            expect(session.set).toBeCalledTimes(0);
        });
    });
});
