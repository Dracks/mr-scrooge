import { FastifyAdapter,NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import request from 'supertest-graphql';

import { BankMovementModule } from '../../bank-transaction/bank-transaction.module';
import { TestDbModule } from '../../common/test-db.module';
import { GetLabelsDocument, GQLGetLabelsQuery, GQLGetLabelsQueryVariables } from '../../common/test-graphql/generated';
import { getGraphQLTestModule } from '../../common/test-graphql/graph-ql.module';
import { GraphsModule } from '../graphs.module';
import { LabelService } from '../services/label.service';
import { LabelFactory } from '../test-data/label.factory';
import { LabelResolver } from './label.resolver';

describe(LabelResolver.name, () => {
    let app!: NestFastifyApplication;
    let server!: FastifyInstance;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TestDbModule, getGraphQLTestModule(() => ({})), GraphsModule],
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
            await app.get(LabelService).createLabel(LabelFactory.build({ name: 'ping' }));
            await app.get(LabelService).createLabel(LabelFactory.build({ name: 'pong' }));
        });

        it('Testing the query', async () => {
            const response = await request<GQLGetLabelsQuery, GQLGetLabelsQueryVariables>(server).query(
                GetLabelsDocument,
            );
            console.log(response.data);
            expect(response.errors).toEqual(undefined);
        });
    });
});