import { Logger } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GenerateResponseUnion, GQLBaseError } from '../../common/errors/gql-error.decorator';
import { Confirmation } from '../../common/graphql/confirmation.object';
import { GqlGroupsId, WrongOwnerId } from '../../session/';
import { NewGraph, UpdatedGraph } from '../gql-objects/graph.input';
import { Graph } from '../gql-objects/graph.object';
import { InvalidGraph } from '../gql-objects/invalid-graph.object';
import { InvalidLabel } from '../gql-objects/invalid-label.object';
import { GraphService } from '../services/graph.service';
import { LabelService } from '../services/label.service';

const NewGraphResponse = GenerateResponseUnion('NewGraphResponse', Graph, [WrongOwnerId, InvalidLabel]);
const UpdateGraphResponse = GenerateResponseUnion('UpdateGraphResponse', Graph, [
    WrongOwnerId,
    InvalidLabel,
    InvalidGraph,
]);
const DeleteGraphResponse = GenerateResponseUnion('DeleteGraphResponse', Confirmation, [InvalidGraph]);

@Resolver()
export class GraphResolver {
    private readonly logger = new Logger(GraphResolver.name);

    constructor(private readonly graphService: GraphService, private readonly labelService: LabelService) {}

    async validateGraph<T extends NewGraph>(groupsId: number[], graph: T): Promise<GQLBaseError | undefined> {
        if (!groupsId.includes(graph.groupOwnerId)) {
            return WrongOwnerId.build({
                validOwners: groupsId,
            });
        }
        const labels = (await this.labelService.getAll([graph.groupOwnerId])).map(label => label.id);
        const allLabels = [
            graph.labelFilter,
            ...(graph.horizontalGroup?.labels ?? []),
            ...(graph.group?.labels ?? []),
        ].filter(Boolean) as number[];
        const invalidLabels = allLabels.filter(label => !labels.includes(label));
        if (invalidLabels.length > 0) {
            return InvalidLabel.build({
                invalidLabels,
            });
        }
        return undefined;
    }

    @Query(() => [Graph])
    async graphs(
        @GqlGroupsId() groupsId: number[],
        @Args('graphsIds', { type: () => [Int], nullable: true }) graphIds: number[],
    ) {
        const graphs = await this.graphService.getGraphs(groupsId, graphIds);
        return graphs;
    }

    @Mutation(() => NewGraphResponse)
    async newGraph(@GqlGroupsId() groupsId: number[], @Args('graph') newGraph: NewGraph) {
        const error = await this.validateGraph(groupsId, newGraph);
        if (error) {
            return error;
        }
        return this.graphService.createGraph(newGraph);
    }

    @Mutation(() => UpdateGraphResponse)
    async updateGraph(@GqlGroupsId() groupsId: number[], @Args('graph') updatedGraph: UpdatedGraph) {
        const graphsId = await this.graphService.getGraphsId(groupsId);
        if (!graphsId.includes(updatedGraph.id)) {
            return InvalidGraph.build({ availableGraphsId: graphsId });
        }
        const error = await this.validateGraph(groupsId, updatedGraph);
        if (error) {
            return error;
        }
        return this.graphService.updateGraph(updatedGraph);
    }

    @Mutation(() => DeleteGraphResponse)
    async deleteGraph(
        @GqlGroupsId() groupsId: number[],
        @Args('graphId', { type: () => Int }) graphId: number,
    ): Promise<InvalidGraph | Confirmation> {
        const graphsId = await this.graphService.getGraphsId(groupsId);
        if (!graphsId.includes(graphId)) {
            return InvalidGraph.build({ availableGraphsId: graphsId });
        }
        await this.graphService.deleteGraph(graphId);
        return {
            confirm: true,
        };
    }
}
