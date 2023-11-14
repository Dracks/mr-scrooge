import { Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/sequelize';
import { Logger } from 'nestjs-pino';
import { Sequelize } from 'sequelize';
import { SequelizeStorage,Umzug } from 'umzug';

import { MigrationsCommand } from './migrations.command';

@Module({
    providers: [
        MigrationsCommand,
        {
            provide: 'Umzug',
            useFactory(sequelize: Sequelize, logger: Logger) {
                return new Umzug({
                    migrations: { glob: 'migrations/*.js' },
                    context: sequelize.getQueryInterface(),
                    storage: new SequelizeStorage({ sequelize }),
                    logger: console,
                });
            },
            inject: [getConnectionToken(), Logger],
        },
    ],
})
export class MigrationsModule {}
