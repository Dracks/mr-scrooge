import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";

import { BankTransactionService } from "../../bank-transaction/bank-transaction.service";
import { BankTransactionBase } from "../../bank-transaction/models/bank-transaction.model";
import { Exception } from "../../core/errors/exception";
import { ensureOrThrow } from "../../core/errors/utils";
import { StatusReport } from "../models/status-report";
import { StatusReportRow } from "../models/status-report-row-import";

export const PARSERS_TOKEN = "PARSERS_TOKEN"

export interface ParserFactory {
    create(filePath: string) : Iterable<BankTransactionBase> | Promise<Iterable<BankTransactionBase>>
    fileRegex: string | RegExp
    key: string
}

@Injectable()
export class NewImportService {

    private parsersMap: Map<string, ParserFactory>

    constructor(
        @Inject(PARSERS_TOKEN) parsers: ParserFactory[],
        private readonly bankTransactionService: BankTransactionService,
        @InjectModel(StatusReport) private readonly statusReportModel: typeof StatusReport,
        @InjectModel(StatusReportRow) private readonly statusReportRowModel: typeof StatusReportRow
    ) {
        this.parsersMap = new Map(parsers.map(parser => [parser.key, parser]))
    }

    generateStatusTransaction(status: StatusReport, transaction: BankTransactionBase): StatusReportRow {
        return this.statusReportRowModel.build({
            ...transaction,
            reportId: status.id
        })
    }

    // eslint-disable-next-line max-statements, max-lines-per-function
    async import(groupOwnerId: number, key: string, fileName: string, filePath: string) {
        const status = this.statusReportModel.build({
            description: '',
            fileName,
            groupOwnerId,
            kind: key,
            status: 'OK',
        })
        try {
            await status.save()
            // Todo: validate we have this mapper
            const source = await ensureOrThrow(this.parsersMap.get(key), new Exception("E10003", 'Parser not found', {parserKey: key})).create(filePath)
            let discarting = true
            // eslint-disable-next-line init-declarations
            let previous : BankTransactionBase | undefined
            // eslint-disable-next-line init-declarations
            let previousState : StatusReportRow | undefined
            for await (const transaction of source){
                // Todo: validate transaction object
                const statusTransaction = this.generateStatusTransaction(status, transaction)
                if (await this.bankTransactionService.existsSimilar(groupOwnerId, key, transaction)){
                    if (discarting){
                        const msg = "repeated row, not inserted"

                        status.status = "WARN"
                        statusTransaction.message = msg
                        // eslint-disable-next-line max-depth
                        if (previousState){
                            previousState.message = msg
                            await previousState.save()
                            previousState = undefined
                        }
                        await statusTransaction.save()
                    } else {
                        previous = transaction
                        previousState = statusTransaction
                        discarting = true
                    }

                } else {
                    if (previous && previousState){
                        const record = await this.bankTransactionService.addTransaction({ kind: key, groupOwnerId, ...previous })
                        previousState.message = "Repeated row, but inserted"
                        previousState.transactionId = record.id
                        await previousState.save()
                        previous = undefined;
                        previousState = undefined;
                    }
                    discarting = false
                    const record = await this.bankTransactionService.addTransaction({ kind: key, groupOwnerId, ...transaction })
                    statusTransaction.transactionId = record.id
                    await statusTransaction.save()
                }

            }
        } catch (error) {
            const errorDict = Exception.getStdDict(error)
            status.description = errorDict.message
            status.stack = errorDict.stack
            status.context = errorDict.context ? JSON.stringify(errorDict.context) : undefined
            status.status = 'ERR'
            await status.save()
        }
        await status.save()
    }
}
