import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import request from 'supertest-graphql';

import { BankTransactionModule } from '../../bank-transaction/bank-transaction.module';
import { TestDbModule } from '../../common/test-db.module';
import { GetLabelsDocument, GQLGetLabelsQuery, GQLGetLabelsQueryVariables } from '../../common/test-graphql/generated';
import { getGraphQLTestModule } from '../../common/test-graphql/graph-ql.module';
import { GraphsModule } from '../graphs.module';
import { LabelService } from '../services/label.service';
import { labelFactory } from '../test-data/label.factory';
import { LabelResolver } from './label.resolver';

describe(LabelResolver.name, () => {
    let app!: NestFastifyApplication;
    let server!: FastifyInstance;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TestDbModule,
                getGraphQLTestModule(() => ({
                    groupsId: [1],
                })),
                GraphsModule,
            ],
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

    describe('testing with some data', () => {
        beforeEach(async () => {
            await app.get(LabelService).createLabel(labelFactory.build({ name: 'ping' }));
            await app.get(LabelService).createLabel(labelFactory.build({ name: 'pong' }));
            await app.get(LabelService).createLabel(labelFactory.build({ name: 'not-in-list', groupOwnerId: 2 }));
        });

        it('Testing the query', async () => {
            const response = await request<GQLGetLabelsQuery, GQLGetLabelsQueryVariables>(server).query(
                GetLabelsDocument,
            );
            expect(response.errors).toEqual(undefined);
            expect(response.data?.labels.map(label => label.name)).toEqual(['ping', 'pong']);
        });
    });
});
