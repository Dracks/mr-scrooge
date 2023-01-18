import { MikroOrmModule } from '@mikro-orm/nestjs';
import type { SqliteDriver } from '@mikro-orm/sqlite';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommandModule } from 'nestjs-command';

import { getDatabaseModule } from '../server/core/database';
import { MyLoggerModule } from '../server/core/logger.module';
import { SessionModule } from '../server/session/session.module';
import { DemoCommand } from './demo.command';
import { LogsCommands } from './logs.command';
import { MigrationsCommand } from './migrations.command';

@Module({
    imports: [
        CommandModule,
        MikroOrmModule.forRoot({
            entities: [],
            type: 'sqlite',
            dbName: './db.sqlite',
        }),
        SessionModule,
        MyLoggerModule,
    ],
    providers: [DemoCommand, LogsCommands, MigrationsCommand],
})
export class CliModule {}
