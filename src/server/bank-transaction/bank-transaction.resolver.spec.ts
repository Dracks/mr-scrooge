import { MercuriusDriver } from '@nestjs/mercurius';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import gql from 'graphql-tag';
import request from 'supertest-graphql';

import { TestDbModule } from '../common/test-db.module';
import { getGraphQLTestModule } from '../common/test-graphql/graph-ql.module';
import { BankMovementModule } from './bank-transaction.module';
import { BankTransactionResolver, GetBankTransactionsResponse } from './bank-transaction.resolver';
import { BankTransactionService } from './bank-transaction.service';
import { IBankTransaction } from './models/bank-transaction.model';
import { BankTransactionFactory } from './test-data/bank-transaction.factory';

const getBankMovements = gql`
    query ($cursor: String, $limit: Int) {
        bankMovements(cursor: $cursor, limit: $limit) {
            movements {
                id
                value
                movementName
                date
            }
            cursor
        }
    }
`;

describe(BankTransactionResolver.name, () => {
    let app!: NestFastifyApplication;
    let server!: FastifyInstance;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TestDbModule, getGraphQLTestModule(() => ({})), BankMovementModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        server = app.getHttpAdapter().getHttpServer();
    });

    afterEach(async () => {
        await app.close();
    });

    it('Starts the server', () => {
        expect(app).toBeTruthy();
    });

    describe('testing cursor and pagination', () => {
        let movements!: IBankTransaction[];
        beforeAll(async () => {
            movements = BankTransactionFactory.buildList(5);
            movements.push(
                BankTransactionFactory.build({
                    date: '2022-02-01',
                }),
            );
            movements.push(
                BankTransactionFactory.build({
                    date: '2022-01-30',
                }),
            );
            movements.push(
                BankTransactionFactory.build({
                    date: '2023-01-30',
                }),
            );
        });

        beforeEach(async () => {
            await app.get(BankTransactionService).insertBatch(movements);
        });

        it('Testing basic pagination', async () => {
            const response = await request<{ bankMovements: GetBankTransactionsResponse }, { limit: number }>(server).query(
                getBankMovements,
                { limit: 5 },
            );
            console.log(response.data);
            expect(response.errors).toEqual(undefined);
            const { movements, cursor } = response.data?.bankMovements ?? {};
            expect(movements).toBeTruthy();
            expect(movements).toHaveLength(5);
            const [firstMovement] = movements ?? [];
            expect(firstMovement.date).toEqual('2023-01-30');
            expect(cursor).toEqual('2022-02-02:1');
        });

        it('Testing cursor with duplicated date', async () => {
            const response = await request<{ bankMovements: GetBankTransactionsResponse }, { cursor: string; limit: number }>(
                server,
            ).query(getBankMovements, { limit: 5, cursor: '2022-02-02:1' });
            console.log(response.data);
            expect(response.errors).toEqual(undefined);
            const { movements, cursor } = response.data?.bankMovements ?? {};
            expect(movements).toBeTruthy();
            expect(movements).toHaveLength(3);
            const [firstMovement] = movements ?? [];
            expect(firstMovement.date).toEqual('2022-02-02');
            expect(firstMovement.id).toEqual(0);
            expect(cursor).toEqual('2022-01-30:6');
        });
    });
});
