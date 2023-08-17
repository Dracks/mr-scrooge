import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { getModelToken } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import * as path from 'path';

import { BankTransactionModule } from "../../bank-transaction/bank-transaction.module";
import { BankTransactionService } from "../../bank-transaction/bank-transaction.service";
import { BankTransactionBase } from "../../bank-transaction/models/bank-transaction.model";
import { TestDbModule } from "../../common/test-db.module";
import { getGraphQLTestModule } from "../../common/test-graphql/graph-ql.module";
import { ImporterModule } from "../importer.module";
import { StatusReportRow } from "../models/status-report-row-import";
import { TransformHelper } from "../transform.helper";
import { NewImportService, ParserFactory, PARSERS_TOKEN } from "./importer.service";
import { N26Importer } from "./n26-importer";
import { StatusReportsService } from "./status-reports.service";

type SampleDataRow = [string, string, number]
const SAMPLE_DATA: SampleDataRow[] = [
    ['first', '1990-03-01', -20.0],
    ['second', '1990-03-02', -10.0],
    ['ingress', '1990-03-03', 100],
    ['first.second', '1990-03-04', -5.0]
];

class TestAccount implements ParserFactory{

    fileRegex = '';

    key = "test-account";

    mapper = new TransformHelper<number>(new Map([['movementName', 0], ['date', 1], ['value', 2]]))

    create(_filePath: string): BankTransactionBase[] {
        return SAMPLE_DATA.map(row => this.mapper.map(row));
    }
}

const groupOwnerId = 1

const getMockFile = (file: string)=> path.join(__dirname, "..", "mocks", file)


describe(`[${NewImportService.name}]`, ()=>{
    let app!: NestFastifyApplication;
    let subject: NewImportService
    let bankTransactionService: BankTransactionService;
    let statusReportsService: StatusReportsService
    let statusRowModel: typeof StatusReportRow;

    const checkImportIsOk = async ()=>{
        const reports = await statusReportsService.getAll([groupOwnerId])
        expect(reports.list.length).toBe(1)
        const [status] = reports.list
        expect(status).toEqual(expect.objectContaining({
            description: "",
            status: "OK",
        }))
    }

    beforeEach(async ()=>{
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TestDbModule,
                getGraphQLTestModule(() => ({
                    groupsId: [groupOwnerId],
                })),
                ImporterModule,
                BankTransactionModule,
            ],
        })
            .overrideProvider(PARSERS_TOKEN)
            .useValue([new TestAccount(), new N26Importer()])
        .compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

        await app.init();
        await app.getHttpAdapter().getInstance().ready();

        subject = app.get(NewImportService)
        bankTransactionService = app.get(BankTransactionService)
        statusRowModel = app.get(getModelToken(StatusReportRow))
        statusReportsService = app.get(StatusReportsService)
    })


    it('insert everything fine', async () => {
        await subject.import(groupOwnerId, 'test-account', 'test-file.csv', 'whatever')

        await checkImportIsOk();

        const transactions = await bankTransactionService.getAll([groupOwnerId])
        expect(transactions.list.length).toBe(4);
        expect(await statusRowModel.count()).toBe(4);
    });

    it('When the parser kind is not found we throw an error', async ()=>{
        await subject.import(groupOwnerId, 'invalid-key', 'some-file', 'someother')
        const reports = await statusReportsService.getAll([groupOwnerId])
        expect(reports.list.length).toBe(1)
        const [first] = reports.list
        expect(first.status).toEqual("ERR")
        expect(first.description).toEqual("E10003: Parser not found")
    })

    it('insert with one duplicated', async () => {
         const [,repeated] = new TestAccount().create("something");

         await bankTransactionService.addTransaction({kind: 'test-account', groupOwnerId, ...repeated})

         await subject.import(groupOwnerId, 'test-account', 'something', 'some-more')

         await checkImportIsOk()

         const transactions = await bankTransactionService.getAll([groupOwnerId])
         expect(transactions.list.length).toBe(5);
         expect(await statusRowModel.count()).toBe(4);
         const reportRowList = await statusRowModel.findOne({where: {movementName: repeated.movementName}})
         expect(reportRowList?.message).toEqual("Repeated row, but inserted")
     })

    it('do not insert multiple duplicates', async () => {
        await subject.import(groupOwnerId, 'test-account', 'some-file', 'someother')

        await subject.import(groupOwnerId, 'test-account', 'some-file', 'someother')

        const reports = await statusReportsService.getAll([groupOwnerId])
        expect(reports.list.length).toBe(2)
        expect(reports.list).toEqual([
            expect.objectContaining({
                description: "",
                status: "WARN",
            }),
            expect.objectContaining({
                description: "",
                status: "OK",
            }),
        ])

        const transactions = await bankTransactionService.getAll([groupOwnerId])
        expect(transactions.list.length).toBe(4);
        expect(await statusRowModel.count()).toBe(8);
    })

    describe(`[${N26Importer.name}]`, ()=>{

        it('inserting data in n26', async () => {
            await subject.import(groupOwnerId, 'n26/es', 'n26-file.csv', getMockFile('n26_es.csv'));

            await checkImportIsOk();

            const transactions = await bankTransactionService.getAll([groupOwnerId])
            expect(transactions.list).toHaveLength(3);

            const queryTest = await statusRowModel.findAll({ where: { date: '2019-01-20' } });
            expect(queryTest).toHaveLength(1);

            const [testValue] = queryTest;
            expect(testValue.value).toEqual(120);
            expect(testValue.movementName).toEqual('Dr Who');
        });

        it('invalid file throws an error and is cached', async ()=>{
            await subject.import(groupOwnerId, 'n26/es', 'n26-file.csv', 'invalid');

            const reports = await statusReportsService.getAll([groupOwnerId])
            expect(reports.list.length).toBe(1)
            const [status] = reports.list
            expect(status).toEqual(expect.objectContaining({
                context: "{\"filePath\":\"invalid\"}",
                description: "E10006: N26 file not found",
                fileName: "n26-file.csv",
                stack: expect.stringContaining("at N26Importer."),
                status: "ERR",
            }))
        })
    })
})
