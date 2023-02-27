import * as secureSession from '@fastify/secure-session';
import { Logger, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { SequelizeModule } from '@nestjs/sequelize';
import { join } from 'path';

import { BankMovementModule } from './bank-transaction/bank-transaction.module';
import { DateOnly } from './common/custom-types/date-only';
import { GQLDateOnly } from './common/custom-types/gql-date-only';
import { ConfigModule } from './core/config/config.module';
import { getDatabaseModule } from './core/database';
import { MyLoggerModule } from './core/logger.module';
import { GraphsModule } from './graphs/graphs.module';
import { ImporterModule } from './importer/importer.module';
import { ReactModule } from './react/react.module';
import { AuthGuard } from './session/guard/auth.guard';
import { AuthInterceptor } from './session/interceptor/auth.interceptor';
import { SessionModule } from './session/session.module';

@Module({
    imports: [
        SequelizeModule.forRoot({
            ...getDatabaseModule(),
            models: [],
            autoLoadModels: true,
            synchronize: true,
            logging: (() => {
                const logger = new Logger('sequelize');
                return msg => logger.debug(msg);
            })(),
        }),
        GraphQLModule.forRoot<MercuriusDriverConfig>({
            driver: MercuriusDriver,
            graphiql: 'graphiql',
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            context: (req: { session: secureSession.Session }) => ({
                session: req.session,
            }),
            buildSchemaOptions: {
                scalarsMap: [{ type: DateOnly, scalar: GQLDateOnly }],
            },
        }),
        MyLoggerModule,
        ConfigModule,
        SessionModule,
        BankMovementModule,
        GraphsModule,
        ImporterModule,
        ReactModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AuthInterceptor,
        }
    ],
})
export class AppModule {}
