import { parse } from 'csv-parse';
import fs from 'node:fs/promises';

import { BankTransactionBase } from '../../bank-transaction/models/bank-transaction.model';
import { Exception } from '../../core/errors/exception';
import { TransformHelper } from '../transform.helper';
import { ParserFactory } from './importer.service';

export class N26Importer implements ParserFactory {
    mapper = new TransformHelper<number>(
        new Map([
            ['movementName', 1],
            ['date', 0],
            ['dateValue', 0],
            ['value', 5],
        ]),
    );

    async *create(filePath: string): AsyncGenerator<BankTransactionBase> {
        try {
            const fileData = await fs.readFile(filePath);
            const csvData = parse(fileData, { autoParseDate: true, delimiter: ',', fromLine: 2 });

            for await (const row of csvData) {
                yield this.mapper.map(row as Record<number, unknown>);
            }
        } catch (error) {
            if (typeof error === 'object' && error && 'code' in error && error.code === 'ENOENT') {
                throw new Exception('E10006', 'N26 file not found', { filePath }, error);
            }
            throw error;
        }
    }

    fileRegex = /n26-csv-transactions.*\.csv/u;

    key = 'n26/es';
}
