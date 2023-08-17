import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";

import { BankTransactionModule } from "../bank-transaction/bank-transaction.module";
import { NewImportService, PARSERS_TOKEN } from "./importers/importer.service";
import { StatusReportsService } from "./importers/status-reports.service";
import { StatusReport } from "./models/status-report";
import { StatusReportRow } from "./models/status-report-row-import";
import { ImportKindResolver } from "./resolvers/import-kind.resolver";

@Module({
    imports: [
        SequelizeModule.forFeature([StatusReport, StatusReportRow]),
        BankTransactionModule,
    ],
    providers: [
        ImportKindResolver,
        NewImportService,
        StatusReportsService,
        {
            provide: PARSERS_TOKEN,
            useValue: []
        }
    ]
})
export class ImporterModule{}
