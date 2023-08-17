import { AbstractImporter, FieldsMapper } from './importer-abstract'
import { FileParsedRow, FileParser } from './types';


const SAMPLE_DATA: FileParsedRow[] = [
    ['first', '1990-03-01', -20.0],
    ['second', '1990-03-02', -10.0],
    ['ingress', '1990-03-03', 100],
    ['first.second', '1990-03-04', -5.0]
];

class TestAccount extends AbstractImporter {
    static key: string = "test-account";

    _mapping : FieldsMapper = new Map([['movementName', 0], ['date', 1], ['value', 2]]) 

    _creator(_filePath: string): FileParser {
        return SAMPLE_DATA;
    }
}


describe('Test Abstract Importer', ()=>{
    let subject: TestAccount

    beforeEach(()=>{
        subject = new TestAccount("ping", 'some-file')
    })
})