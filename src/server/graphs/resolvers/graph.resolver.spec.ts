/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
import { FastifyAdapter,NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import request from 'supertest-graphql';

import { TestDbModule } from '../../common/test-db.module';
import { GetGraphsByIdDocument, GetGraphsDocument, GQLGetGraphsByIdQuery, GQLGetGraphsByIdQueryVariables, GQLGetGraphsQuery, GQLGetGraphsQueryVariables,  GQLGraph, GQLGraphDateRange, GQLGraphGroup, GQLGraphKind,GQLNewGraphMutation, GQLNewGraphMutationVariables, GQLUpdateGraphMutation, GQLUpdateGraphMutationVariables, NewGraphDocument, UpdateGraphDocument } from '../../common/test-graphql/generated';
import { getGraphQLTestModule } from '../../common/test-graphql/graph-ql.module';
import {WrongOwnerId} from '../../session'
import { InvalidGraph } from '../gql-objects/invalid-graph.object';
import { GraphsModule } from '../graphs.module';
import { GraphDateRange, GraphGroup, GraphKind } from '../models/graph.model';
import { Graph, GraphService } from '../services/graph.service';
import { LabelService } from '../services/label.service';
import { GQLGraphFactory, GraphFactory } from '../test-data/graph.factory';
import { labelFactory } from '../test-data/label.factory';
import { GraphResolver } from './graph.resolver';

describe(GraphResolver.name, () => {
    let app!: NestFastifyApplication;
    let server!: FastifyInstance;
    let graphService!: GraphService;

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
        graphService = app.get(GraphService)
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
                dateRange: GraphDateRange.oneYear,
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
                name: 'huge graph',
            }))
            await app.get(GraphService).createGraph(GraphFactory.build({name: 'first', groupOwnerId: 3, id: 12344}))
        });

        it('Testing query the graphs', async () => {
            const response = await request<GQLGetGraphsQuery, GQLGetGraphsQueryVariables>(server).query(
                GetGraphsDocument,
            );
            expect(response.errors).toEqual(undefined);
            expect(response.data?.graphs).toHaveLength(2)
            expect(response.data?.graphs[0]).toMatchSnapshot();
            expect(response.data?.graphs[1]).toMatchSnapshot();
        });

        it('Testing query the graphs', async () => {
            const response = await request<GQLGetGraphsByIdQuery, GQLGetGraphsByIdQueryVariables>(server).query(
                GetGraphsByIdDocument,
                {graphsIds: [34]}
            );
            expect(response.errors).toEqual(undefined);
            expect(response.data?.graphs).toHaveLength(1)
            expect(response.data?.graphs[0].id).toEqual(34);
        });
    })

    describe ('Creating a new graph', ()=>{
        it('Testing the new graph', async ()=>{
            const {id: _id, ...newGraph} = GQLGraphFactory.build({
                kind: GQLGraphKind.Bar,
            })
            const response = await request<GQLNewGraphMutation, GQLNewGraphMutationVariables>(server).mutate(
                NewGraphDocument,
                {
                    graph: newGraph,
                }
            )
            expect(response.errors).toEqual(undefined);
            expect(response.data?.newGraph?.__typename).toEqual('Graph');
            const data = response.data?.newGraph as GQLGraph
            expect(data.id).toBeTruthy()
            expect(data).toMatchSnapshot()

            const dbGraph = await graphService.getGraphById(data.id)
            expect(dbGraph).toEqual({
                dateRange: "six",
                group: {
                    graphId: 1,
                    group: "month",
                    hideOthers: null,
                },
                groupOwnerId: 1,
                id: data.id,
                kind: "bar",
                labelFilter: null,
                name: "name: 0",
            })
        })

        it('Testing the new graph with invalid owner Id', async ()=>{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {id: _id, ...newGraph} = GQLGraphFactory.build({ 
                groupOwnerId: 35,
                kind: GQLGraphKind.Bar,
            })
            const response = await request<GQLNewGraphMutation, GQLNewGraphMutationVariables>(server).mutate(
                NewGraphDocument,
                {
                    graph: newGraph,
                }
            )
            expect(response.errors).toEqual(undefined);
            expect(response.data?.newGraph?.__typename).toEqual('WrongOwnerId');
            const data = response.data?.newGraph as Partial<WrongOwnerId>
            expect(data.validOwners).toEqual([1])
        })
    });

    describe('UpdateGraph', ()=>{
        let existingGraphs!: Graph[] 
        let updatedGraph!: GQLGraph
        beforeEach(async ()=>{
            const graphsToCreate = [
                GraphFactory.build()
            ]
            existingGraphs = await Promise.all(graphsToCreate.map(graph => graphService.createGraph(graph))) 
            updatedGraph = GQLGraphFactory.build({
                dateRange: GQLGraphDateRange.HalfYear,
                group: {
                    group: GQLGraphGroup.Labels,
                    labels: [2,4]
                },
                horizontalGroup: {
                    group: GQLGraphGroup.Labels,
                    labels: [3,5]
                },
                id: existingGraphs[0].id,
                labelFilter: 1,
                name: 'Updated graph',
            })
        })
        it('testing updating a graph with invalid id', async ()=>{
            updatedGraph.id = -1;

            const response = await request<GQLUpdateGraphMutation, GQLUpdateGraphMutationVariables>(server).mutate(
                UpdateGraphDocument,
                { graph: updatedGraph }
            )

            expect(response.errors).toEqual(undefined)
            expect(response.data?.updateGraph.__typename).toEqual('InvalidGraph')
            const error = response.data?.updateGraph as unknown as InvalidGraph;
            expect(error.availableGraphsId).toEqual(existingGraphs.map(graph => graph.id))
        })

        it('testing updating a graph with invalid labels', async () => {
            const response = await request<GQLUpdateGraphMutation, GQLUpdateGraphMutationVariables>(server).mutate(
                UpdateGraphDocument,
                { graph: updatedGraph }
            )

            expect(response.errors).toEqual(undefined)
            expect(response.data?.updateGraph.__typename).toEqual('InvalidLabel')
        })

        it('testing with valid data', async ()=>{
            const labelsList = labelFactory.buildList(10)
            const labelService = app.get(LabelService)
            await Promise.all(labelsList.map(label => labelService.createLabel(label)))

            const response = await request<GQLUpdateGraphMutation, GQLUpdateGraphMutationVariables>(server).mutate(
                UpdateGraphDocument,
                { graph: updatedGraph }
            )

            expect(response.errors).toEqual(undefined)
            expect(response.data?.updateGraph.__typename).toEqual('Graph')
        })
    })
});
