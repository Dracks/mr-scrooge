/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import request from 'supertest-graphql';

import { TestDbModule } from '../../common/test-db.module';
import {
    GetGraphsDocument,
    GQLGetGraphsQuery,
    GQLGetGraphsQueryVariables,
    GQLGraph,
    GQLGraphGroup,
    GQLGraphKind,
    GQLNewGraphMutation,
    GQLNewGraphMutationVariables,
    NewGraphDocument,
} from '../../common/test-graphql/generated';
import { getGraphQLTestModule } from '../../common/test-graphql/graph-ql.module';
import { WrongOwnerId } from '../../session';
import { GraphsModule } from '../graphs.module';
import { GraphDateRange, GraphGroup, GraphKind } from '../models/graph.model';
import { GraphService } from '../services/graph.service';
import { GQLGraphFactory, GraphFactory } from '../test-data/graph.factory';
import { GraphResolver } from './graph.resolver';

describe(GraphResolver.name, () => {
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
            await app.get(GraphService).createGraph(GraphFactory.build({ name: 'first', id: 1 }));
            await app.get(GraphService).createGraph(
                GraphFactory.build({
                    dateRange: GraphDateRange.oneYear,
                    group: {
                        group: GraphGroup.Labels,
                        hideOthers: false,
                        labels: [1, 2],
                    },
                    horizontalGroup: {
                        group: GraphGroup.Labels,
                        hideOthers: true,
                        labels: [3, 4],
                    },
                    id: 34,
                    kind: GraphKind.Line,
                    name: 'huge graph',
                }),
            );
            await app.get(GraphService).createGraph(GraphFactory.build({ name: 'first', groupOwnerId: 3, id: 12344 }));
        });

        it('Testing query the graphs', async () => {
            const response = await request<GQLGetGraphsQuery, GQLGetGraphsQueryVariables>(server).query(
                GetGraphsDocument,
            );
            expect(response.errors).toEqual(undefined);
            expect(response.data?.graphs).toHaveLength(2);
            expect(response.data?.graphs[0]).toMatchSnapshot();
            expect(response.data?.graphs[1]).toMatchSnapshot();
        });
    });

    describe('Creating a new graph', () => {
        it('Testing the new graph', async () => {
            const { id: _id, ...newGraph } = GQLGraphFactory.build({});
            const response = await request<GQLNewGraphMutation, GQLNewGraphMutationVariables>(server).mutate(
                NewGraphDocument,
                {
                    graph: {
                        ...newGraph,
                        kind: GQLGraphKind.Bar,
                        group: {
                            ...newGraph.group,
                            group: GQLGraphGroup.Month,
                        },
                        horizontalGroup: newGraph.horizontalGroup && {
                            ...newGraph.horizontalGroup,
                            group: GQLGraphGroup.Month,
                        },
                    },
                },
            );
            expect(response.errors).toEqual(undefined);
            expect(response.data?.newGraph?.__typename).toEqual('Graph');
            const data = response.data?.newGraph as GQLGraph;
            expect(data.id).toBeTruthy();
            expect(data).toMatchSnapshot();
        });

        it('Testing the new graph with invalid owner Id', async () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...newGraph } = GQLGraphFactory.build({ groupOwnerId: 35 });
            const response = await request<GQLNewGraphMutation, GQLNewGraphMutationVariables>(server).mutate(
                NewGraphDocument,
                {
                    graph: {
                        ...newGraph,
                        kind: GQLGraphKind.Bar,
                        group: {
                            ...newGraph.group,
                            group: GQLGraphGroup.Month,
                        },
                        horizontalGroup: newGraph.horizontalGroup && {
                            ...newGraph.horizontalGroup,
                            group: GQLGraphGroup.Month,
                        },
                    },
                },
            );
            expect(response.errors).toEqual(undefined);
            expect(response.data?.newGraph?.__typename).toEqual('WrongOwnerId');
            const data = response.data?.newGraph as Partial<WrongOwnerId>;
            expect(data.validOwners).toEqual([1]);
        });
    });
});
