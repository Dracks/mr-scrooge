import * as secureSession from '@fastify/secure-session';
import { Logger, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { SequelizeModule } from '@nestjs/sequelize';
import { join } from 'path';

import { BankMovementModule } from './bank-transaction/bank-transaction.module';
import { DateOnly } from './common/custom-types/date-only';
import { GQLDateOnly } from './common/custom-types/gql-date-only';
import { getDatabaseModule } from './core/database';
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
        SessionModule,
        BankMovementModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {}
