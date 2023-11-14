import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommandModule } from 'nestjs-command';

import { BankMovementModule } from '../server/bank-transaction/bank-transaction.module';
import { getDatabaseModule } from '../server/core/database';
import { MyLoggerModule } from '../server/core/logger.module';
import { GraphsModule } from '../server/graphs/graphs.module';
import { SessionModule } from '../server/session/session.module';
import { CliConfigModule } from './config/cli-config.module';
import { DemoCommand } from './demo.command';
import { DemoDataService } from './demo-data.service';
import { LogsCommands } from './logs.command';
import { MigrationsModule } from './migrations/migrations.module';

@Module({
    imports: [
        CommandModule,
        SequelizeModule.forRoot({
            ...getDatabaseModule(),
            models: [],
            autoLoadModels: true,
            synchronize: false,
        }),
        SessionModule,
        MyLoggerModule,
        CliConfigModule,
        GraphsModule,
        BankMovementModule,
        MigrationsModule,
    ],
    providers: [DemoCommand, LogsCommands, DemoDataService],
})
export class CliModule {}
