import { parse } from 'csv-parse';
import fs from 'node:fs/promises';

import { BankTransactionBase } from '../../bank-transaction/models/bank-transaction.model';
import { Exception } from '../../core/errors/exception';
import { MapLocalDate } from '../map-local-date.helper';
import { TransformHelper } from '../transform.helper';
import { ParserFactory } from './importer.service';

export class CommerzBankEnImporter implements ParserFactory {
    static DATE_REGEX = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T\d{2}:\d{2}:\d{2}/u;

    fieldsMap = new Map<keyof BankTransactionBase, number>([
        ['movementName', 9],
        ['date', 11],
        ['dateValue', 1],
        ['value', 4],
        ['details', 10],
    ]);
    mapper = new TransformHelper<number>(this.fieldsMap);
    dateParser = new MapLocalDate(this.fieldsMap, 'dd.MM.yyyy');

    // eslint-disable-next-line class-methods-use-this
    splitMessage(_message: string): [string, string?, string?] {
        let message: string = _message;
        let movementName = '';
        if (message.startsWith('Auszahlung')) {
            message = message.slice('Auszahlung'.length); // Auszahlung length
        } else if (message.startsWith('Kartenzahlung')) {
            message = message.slice('Kartenzahlung'.length); // Kartenzahlung length
        }

        const dateMatch = CommerzBankEnImporter.DATE_REGEX.exec(message);
        const endIndex = message.indexOf('End-to-End-Ref');
        if (dateMatch) {
            const { index } = dateMatch;
            movementName = message.slice(0, index);
            const { year, month, day } = dateMatch.groups ?? {};
            const dateInfo = `${day}.${month}.${year}`;
            // eslint-disable-next-line init-declarations
            let details: string | undefined;
            if (movementName.indexOf('/') > 0) {
                details = movementName.slice(movementName.indexOf('/') + 2).trim();
                movementName = movementName.slice(0, movementName.indexOf('/'));
            }
            return [movementName.trim(), details, dateInfo];
        } else if (endIndex !== -1) {
            return [message.slice(0, endIndex).trim()];
        }
        return [message];
    }

    build(row: unknown[]): BankTransactionBase {
        const splitMessage = this.splitMessage(row[3] as string);
        let [, , newDate] = splitMessage;
        const [movementName, details] = splitMessage;

        if (!newDate) {
            newDate = row[0] as string;
        }
        row.push(movementName, details, newDate);
        this.dateParser.transform(row);

        return this.mapper.map(row as Record<number, unknown>);
    }

    async *create(filePath: string): AsyncGenerator<BankTransactionBase> {
        try {
            const fileData = await fs.readFile(filePath);
            const csvData = parse(fileData, { autoParseDate: false, delimiter: ',', fromLine: 2 });

            for await (const row of csvData) {
                yield this.build(row);
            }
        } catch (error) {
            if (typeof error === 'object' && error && 'code' in error && error.code === 'ENOENT') {
                throw new Exception('E10007', 'CommerzBank file not found', { filePath }, error);
            }
            throw error;
        }
    }

    fileRegex = /Umsaetze_KtoNr.*\.CSV/u;

    key = 'commerz-bank/en';
}
