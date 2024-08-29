import * as path from 'path';

import { BankTransactionBase } from '../../bank-transaction/models/bank-transaction.model';
import { TransformHelper } from '../transform.helper';
import { ParserFactory } from './importer.service';

export const getMockFile = (file: string)=> path.join(__dirname, "..", "mocks", file)


type SampleDataRow = [string, string, number]
const SAMPLE_DATA: SampleDataRow[] = [
    ['first', '1990-03-01', -20.0],
    ['second', '1990-03-02', -10.0],
    ['ingress', '1990-03-03', 100],
    ['first.second', '1990-03-04', -5.0]
];

export class TestBasicImporter implements ParserFactory{

    fileRegex = '';

    key = "test-account";

    mapper = new TransformHelper<number>(new Map([['movementName', 0], ['date', 1], ['value', 2]]))

    create(_filePath: string): BankTransactionBase[] {
        return SAMPLE_DATA.map(row => this.mapper.map(row));
    }
}

export class TestDynamicImporter implements ParserFactory{
    fileRegex = ''
    key = 'test-dynamic'
    mapper = new TransformHelper<number>(new Map([['movementName', 0], ['date', 1], ['value', 2]]))
    constructor(public ammount: number=10) { }

    *create (_filePath: string): Generator<BankTransactionBase> {
        for (let idx = 0; idx < this.ammount; idx+=1){
            yield this.mapper.map([`movement ${idx}`, new Date().toISOString(), idx])
        }
    }
}
