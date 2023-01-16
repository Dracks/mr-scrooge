import * as secureSession from '@fastify/secure-session'
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver,MercuriusDriverConfig} from '@nestjs/mercurius'
import {MikroOrmModule} from '@mikro-orm/nestjs';

import {join} from 'path';

import { getDatabaseModule } from './core/database'
import { MyLoggerModule } from './core/logger.module';
import { AuthGuard } from './session/guard/auth.guard';
import { SessionModule } from './session/session.module';


@Module({
	imports: [
		GraphQLModule.forRoot<MercuriusDriverConfig>({
      		driver: MercuriusDriver,
      		graphiql: "graphiql",
      		autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      		context: (req: {session: secureSession.Session})=>({     				
      				session: req.session
      			})
    	}),
    	MikroOrmModule.forRoot({
            // entities: ['build/**/entities'],
            // entitiesTs: ['src/server/**/entities'],
            autoLoadEntities: true,
            type: "sqlite",
            dbName: './db.sqlite'

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