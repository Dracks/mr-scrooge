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
        GraphsModule,
        BankMovementModule,
    ],
    providers: [DemoCommand, LogsCommands, MigrationsCommand, DemoDataService],
})
export class CliModule {}
