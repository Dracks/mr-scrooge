import { parse } from 'csv-parse';
import fs from 'node:fs';
import { finished, pipeline } from 'node:stream/promises';

import { BankTransactionBase } from "../../bank-transaction/models/bank-transaction.model";
import { Exception } from '../../core/errors/exception';
import { TransformHelper } from '../transform.helper';
import { ParserFactory } from "./importer.service";

export class N26Importer implements ParserFactory {

    mapper = new TransformHelper<number>(new Map([
        ['movementName', 1],
        ['date', 0],
        ['dateValue', 0],
        ['value', 5],
    ]))

    async create(filePath: string): Promise<Iterable<BankTransactionBase>> {
        try {
            const data = Array<BankTransactionBase>()
            const sourceFile = fs.createReadStream(filePath)
            const sourceData =
                    sourceFile
                    .pipe(
                parse({
                    autoParseDate: true,
                    delimiter: ',',
                    fromLine: 2,
                }))

            sourceData.on('readable', () => {
                let row: unknown | undefined = undefined;
                while ((row = sourceData.read()) !== null) {
                    data.push(this.mapper.map(row as Record<number, unknown>));
                }
              });
            await finished(sourceFile)
            await finished(sourceData)


            return data;
        } catch (error) {
            if (typeof error === 'object' && error && 'code' in error && error.code === 'ENOENT'){
                throw new Exception('E10006', 'N26 file not found', {filePath}, error)
            }
            throw error;
        }
    }

    fileRegex = /n26-csv-transactions.*\.csv/u;

    key = "n26/es";


}
