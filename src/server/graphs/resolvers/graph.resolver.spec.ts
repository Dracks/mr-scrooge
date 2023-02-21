import { FastifyAdapter,NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import request from 'supertest-graphql';

import { BankMovementModule } from '../../bank-transaction/bank-transaction.module';
import { TestDbModule } from '../../common/test-db.module';
import { GetGraphsDocument, GetLabelsDocument, GQLGetGraphsQuery, GQLGetGraphsQueryVariables, GQLGetLabelsQuery, GQLGetLabelsQueryVariables } from '../../common/test-graphql/generated';
import { getGraphQLTestModule } from '../../common/test-graphql/graph-ql.module';
import { GraphsModule } from '../graphs.module';
import { GraphGroup, GraphKind } from '../models/graph.model';
import { GraphService } from '../services/graph.service';
import { LabelService } from '../services/label.service';
import { GraphFactory } from '../test-data/graph.factory';
import { LabelFactory } from '../test-data/label.factory';
import { GraphResolver } from './graph.resolver';

describe(GraphResolver.name, () => {
    let app!: NestFastifyApplication;
    let server!: FastifyInstance;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TestDbModule, getGraphQLTestModule(() => ({
                groupsId: [1]
            })), GraphsModule],
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
            await app.get(GraphService).createGraph(GraphFactory.build({name: 'first', id: 1}))
            await app.get(GraphService).createGraph(GraphFactory.build({
              name: 'huge graph',
              dateRange: 'twelve',
              group: {
                  group: GraphGroup.Labels,
                  hideOthers: false,
                  labels: [ 1, 2],
              },
              horizontalGroup: {
                  group: GraphGroup.Labels,
                  hideOthers: true,
                  labels: [ 3 , 4 ],
              },
              id: 34,
              kind: GraphKind.Line,
            }))
            await app.get(GraphService).createGraph(GraphFactory.build({name: 'first', groupOwnerId: 3, id: 12344}))
        });

        it('Testing the query', async () => {
            const response = await request<GQLGetGraphsQuery, GQLGetGraphsQueryVariables>(server).query(
                GetGraphsDocument,
            );
            expect(response.errors).toEqual(undefined);
            expect(response.data?.graphs).toHaveLength(2)
            expect(response.data?.graphs[0]).toMatchSnapshot();
            expect(response.data?.graphs[1]).toMatchSnapshot();
        });
    });
});