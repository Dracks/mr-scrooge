import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { BankTransactionModule } from '../bank-transaction/bank-transaction.module';
import { CommerzBankEnImporter } from './importers/commerz-bank-importer';
import { NewImportService, PARSERS_TOKEN } from './importers/importer.service';
import { N26Importer } from './importers/n26-importer';
import { StatusReportsService } from './importers/status-reports.service';
import { StatusReport } from './models/status-report';
import { StatusReportRow } from './models/status-report-row-import';
import { ImportResolver } from './resolvers/import.resolver';

@Module({
    imports: [SequelizeModule.forFeature([StatusReport, StatusReportRow]), BankTransactionModule],
    providers: [
        NewImportService,
        StatusReportsService,
        ImportResolver,
        {
            provide: PARSERS_TOKEN,
            useValue: [new N26Importer(), new CommerzBankEnImporter()],
        },
    ],
})
export class ImporterModule {}
