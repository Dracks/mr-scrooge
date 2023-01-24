import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommandModule } from 'nestjs-command';

import { getDatabaseModule } from '../server/core/database';
import { MyLoggerModule } from '../server/core/logger.module';
import { SessionModule } from '../server/session/session.module';
import { DemoCommand } from './demo.command';
import { LogsCommands } from './logs.command';
import { CliConfigModule} from './config/cli-config.module'
import { MigrationsCommand } from './migrations.command';

@Module({
    imports: [
        CommandModule,
        SequelizeModule.forRoot({
            ...getDatabaseModule(),
            models: [],
            autoLoadModels: true,
            synchronize: true,
        }),
        SessionModule,
        MyLoggerModule,
        CliConfigModule,
    ],
    providers: [DemoCommand, LogsCommands, MigrationsCommand],
})
export class CliModule {}