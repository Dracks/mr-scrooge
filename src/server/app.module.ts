import * as secureSession from '@fastify/secure-session'
import { Module, Logger } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver,MercuriusDriverConfig} from '@nestjs/mercurius'
import { SequelizeModule } from '@nestjs/sequelize';
import {join} from 'path';

import { getDatabaseModule } from './core/database'
import { MyLoggerModule } from './core/logger.module';
import { AuthGuard } from './session/guard/auth.guard';
import { SessionModule } from './session/session.module';


@Module({
	imports: [
		SequelizeModule.forRoot({
			...getDatabaseModule(),
			models: [],
      		autoLoadModels: true,
      		synchronize: true,
      		logging: (()=>{ const logger = new Logger('sequelize'); return (msg) => logger.debug(msg);})()
		}),
		GraphQLModule.forRoot<MercuriusDriverConfig>({
      		driver: MercuriusDriver,
      		graphiql: "graphiql",
      		autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      		context: (req: {session: secureSession.Session})=>({     				
      				session: req.session
      			})
    	}),
		MyLoggerModule,
    	SessionModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	]
})
export class AppModule{}