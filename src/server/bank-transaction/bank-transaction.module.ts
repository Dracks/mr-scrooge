import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { BankTransactionResolver } from './bank-transaction.resolver';
import { BankTransactionService } from './bank-transaction.service';
import { BankTransaction } from './models/bank-transaction.model';

@Module({
    imports: [SequelizeModule.forFeature([BankTransaction])],
    providers: [BankTransactionService, BankTransactionResolver],
    exports: [BankTransactionService],
})
export class BankMovementModule {}
