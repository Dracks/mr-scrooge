import * as secureSession from '@fastify/secure-session'
import {INestApplication} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {FastifyInstance} from 'fastify';
import request from 'supertest-graphql'
import gql from 'graphql-tag'
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver,MercuriusDriverConfig} from '@nestjs/mercurius'

import { TestDbModule } from '../../common/test-tools/test-db.module';
import {mockPartial} from '../../common/test-tools/mock-partial'
import { LoginArgs, SessionResolver } from './session.resolver';
import { SessionModule } from '../session.module'
import {UserProfileService} from '../user-profile.service'
import {MyLoggerModule} from '../../core/logger.module'
import { UserModel, UserModelAttributes } from '../models/user.model';

const myProfile = gql`query {
	me {
		__typename
	}
}
`

const login = gql`mutation login($credentials: LoginArgs!){
	login(credentials: $credentials){
		__typename
	}
}`


describe(SessionResolver.name, ()=>{
	let app!: NestFastifyApplication;
	let session!: jest.Mocked<secureSession.Session>;
	let server!:FastifyInstance 

	beforeEach(async ()=>{
		session = mockPartial<jest.Mocked<secureSession.Session> >({
			get: jest.fn(),
			set: jest.fn()
		})
	 	const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
            	TestDbModule,
            	GraphQLModule.forRoot<MercuriusDriverConfig>({
		      		driver: MercuriusDriver,
		      		graphiql: "graphiql",
		      		autoSchemaFile: `/tmp/mr-scrooge-tests/${Math.random()}.gql`,
		      		context: ()=>({     				
		      				session,
		      			})
		    	}),
				MyLoggerModule,
		    	SessionModule,
            ]	
		}).compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter())

		await app.init()
		await app.getHttpAdapter().getInstance().ready();
		server = app.getHttpAdapter().getHttpServer()

	});

	afterEach(()=>{
		app.close();
	})

	it('Starts the service', ()=>{
		expect(app).toBeTruthy();
	})

	describe('query MyProfile me', ()=>{
		let user!: UserModelAttributes

		beforeEach(async ()=>{
			const profileService = app.get(UserProfileService);
			user = await profileService.addUser('test-user', 'test-user1', {isActive: true})
		})

		it('When we are not identified, it returns invalid', async ()=>{
			const {data} = await request<{me: {__typename: string}}>(server).query(myProfile).expectNoErrors();
			expect(data?.me.__typename).toEqual("NotIdentified")
    	})

    	it('When we are identified we recover the profile', async ()=>{
    		session.get.mockReturnValue(user.id)

    		const {data} = await request<{me: {__typename: string}}>(server).query(myProfile).expectNoErrors();

    		expect(data?.me).toEqual({
    			__typename: 'MyProfile'
    		})
    	})
	})

	describe('mutation Login', ()=>{
		let userValid!: UserModelAttributes
		let userDisabled!: UserModelAttributes

		beforeEach(async ()=>{
			const profileService = app.get(UserProfileService);
			userValid = await profileService.addUser('test-user1', 'test-user1', {isActive: true, email: 'my@email.com'})

			userDisabled = await profileService.addUser('test-user2', 'test-user2', {isActive: false})
		})

		it('login correctly with username', async ()=>{
			const {data, errors} = await request<{login: {__typename: string}}, {credentials: LoginArgs}>(server).query(login,{credentials: {username: 'test-user1', password: 'test-user1'}})
			expect(errors).toBeUndefined()
			expect(data).toEqual({login: {__typename: 'MyProfile'}})
			expect(session.set).toBeCalledTimes(1)
		})

		it('login correctly with email', async ()=>{
			const {data, errors} = await request<{login: {__typename: string}}, {credentials: LoginArgs}>(server).query(login,{credentials: {username: userValid.email, password: 'test-user1'}})
			expect(errors).toBeUndefined()
			expect(data).toEqual({login: {__typename: 'MyProfile'}})
			expect(session.set).toBeCalledTimes(1)
		})

		it('login inactive username', async ()=>{
			const {data, errors} = await request<{login: {__typename: string}}, {credentials: LoginArgs}>(server).query(login,{credentials: {username: 'test-user2', password: 'test-user2'}})
			expect(errors).toBeUndefined()
			expect(data).toEqual({login: {__typename: 'InvalidCredentials'}})
			expect(session.set).toBeCalledTimes(0)
		})
	})
})