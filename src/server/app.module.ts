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
import { RulesModule } from './rules/rules.module';

@Module({
    imports: [
        SequelizeModule.forRoot({
            ...getDatabaseModule(),
            autoLoadModels: true,
            logging: (() => {
                const logger = new Logger('sequelize');
                return msg => logger.debug(msg);
            })(),
            models: [],
            synchronize: true,
        }),
        GraphQLModule.forRoot<MercuriusDriverConfig>({
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            buildSchemaOptions: {
                scalarsMap: [{ type: DateOnly, scalar: GQLDateOnly }],
            },
            context: (req: { session: secureSession.Session }) => ({
                session: req.session,
            }),
            driver: MercuriusDriver,
            graphiql: 'graphiql',
        }),
        MyLoggerModule,
        ConfigModule,
        SessionModule,
        BankMovementModule,
        GraphsModule,
        ImporterModule,
        RulesModule,
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
        },
    ],
})
export class AppModule {}
