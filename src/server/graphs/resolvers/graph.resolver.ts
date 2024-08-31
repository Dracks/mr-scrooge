import { Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GenerateResponseUnion } from '../../common/errors/gql-error.decorator';
import { GqlGroupsId, WrongOwnerId } from '../../session/';
import { NewGraph, UpdatedGraph } from '../gql-objects/graph.input';
import { Graph } from '../gql-objects/graph.object';
import { GraphService } from '../services/graph.service';

const NewGraphResponse = GenerateResponseUnion('NewGraphResponse', Graph, [WrongOwnerId]);

@Resolver()
export class GraphResolver {
    private readonly logger = new Logger(GraphResolver.name);

    constructor(private readonly graphService: GraphService) {}

    @Query(() => [Graph])
    async graphs(@GqlGroupsId() groupsId: number[]) {
        const graphs = await this.graphService.getGraphs(groupsId);
        return graphs;
    }

    @Mutation(() => NewGraphResponse)
    newGraph(@GqlGroupsId() groupsId: number[], @Args('graph') newGraph: NewGraph) {
        if (groupsId.includes(newGraph.groupOwnerId)) {
            return this.graphService.createGraph(newGraph);
        }
        return WrongOwnerId.build({
            validOwners: groupsId,
        });
    }

    // eslint-disable-next-line class-methods-use-this
    @Mutation(() => Graph)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    updateGraph(@Args('graph') updatedGraph: UpdatedGraph) {}
}
