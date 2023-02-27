import { Logger } from "@nestjs/common";
import { Resolver, Query } from "@nestjs/graphql";
import { GqlGroupsId } from "../../session/decorators/gql-groups-id";
import { Graph } from "../gql-objects/graph.object";
import { GraphService } from "../services/graph.service";

@Resolver()
export class GraphResolver{
    private readonly logger = new Logger(GraphResolver.name)

    constructor(private readonly graphService: GraphService){

    }

    @Query(()=>[Graph])
    async graphs(@GqlGroupsId() groupsId: number[]){
        const graphs = await this.graphService.getGraphs(groupsId);
        return graphs
    }
    
}