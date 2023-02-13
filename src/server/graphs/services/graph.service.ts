import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, InferAttributes, InferCreationAttributes } from 'sequelize';

import {
    GraphGroupModel,
    GraphGroupTagsModel,
    GraphHorizontalGroupModel,
    GraphHorizontalGroupTagsModel,
    GraphModel,
} from '../models/graph.model';

export interface NewGraph extends CreationAttributes<GraphModel> {
    group: CreationAttributes<GraphGroupModel> & { tags?: number[] };
    horizontalGroup?: CreationAttributes<GraphHorizontalGroupModel> & { tags?: number[] };
}

export interface Graph extends InferAttributes<GraphModel> {
    group: Omit<InferAttributes<GraphGroupModel>, 'graphId'> & { tags?: number[] };
    horizontalGroup?: Omit<InferAttributes<GraphHorizontalGroupModel>, 'graphId'> & { tags?: number[] };
}

class GraphBuilder {
    readonly graph: Graph;

    constructor(graph: InferAttributes<GraphModel>, group: InferAttributes<GraphGroupModel>) {
        this.graph = {
            ...graph,
            group: {
                ...group,
            },
        };
    }

    setGroupTags(groupTags: InferAttributes<GraphGroupTagsModel>[]) {
        this.graph.group.tags = groupTags.map(tag => tag.labelId);
    }

    setHorizontalGroup(horizontalGroup: InferAttributes<GraphHorizontalGroupModel>) {
        this.graph.horizontalGroup = horizontalGroup;
    }

    setHorizontalGroupTags(groupTags: InferAttributes<GraphHorizontalGroupTagsModel>[]) {
        if (!this.graph.horizontalGroup) {
            throw new Error(`Graph horizontal group should be defined before setting group tags`);
        }
        this.graph.horizontalGroup.tags = groupTags.map(tag => tag.labelId);
    }
}

@Injectable()
export class GraphService {
    constructor(
        @InjectModel(GraphModel) private readonly graphModel: typeof GraphModel,
        @InjectModel(GraphGroupModel) private readonly graphGroupModel: typeof GraphGroupModel,
        @InjectModel(GraphGroupTagsModel) private readonly graphGroupTagsModel: typeof GraphGroupTagsModel,
        @InjectModel(GraphHorizontalGroupModel)
        private readonly graphHorizontalGroupModel: typeof GraphHorizontalGroupModel,
        @InjectModel(GraphHorizontalGroupTagsModel)
        private readonly graphHorizontalGroupTagsModel: typeof GraphHorizontalGroupTagsModel,
    ) {}

    packGraph(
        graph: InferAttributes<GraphModel>,
        group: InferAttributes<GraphGroupModel>,
        groupTags?: InferAttributes<GraphGroupTagsModel>[],
    ): Graph {
        return {
            ...graph,
            group: {
                ...group,
                tags: groupTags ? groupTags.map(tag => tag.labelId) : undefined,
            },
        };
    }

    async createGraph({ group: { tags: groupTags, ...group }, horizontalGroup, ...graph }: NewGraph) {
        const graphData = await this.graphModel.create(graph);
        const graphId = graphData.dataValues.id;
        const groupData = await this.graphGroupModel.create({
            ...group,
            graphId,
        });

        const returnData = new GraphBuilder(graphData.dataValues, groupData.dataValues);

        if (groupTags) {
            const groupId = groupData.dataValues.id;
            const groupTagsData = await Promise.all(
                groupTags.map(tag => this.graphGroupTagsModel.create({ groupId, labelId: tag })),
            );
            returnData.setGroupTags(groupTagsData.map(tag => tag.dataValues));
        }
        if (horizontalGroup) {
            const { tags: horizontalTags, ...newHorizontalGroup } = horizontalGroup;
            const horizontalGroupData = await this.graphHorizontalGroupModel.create({
                ...newHorizontalGroup,
                graphId,
            });
            returnData.setHorizontalGroup(horizontalGroupData.dataValues);

            if (horizontalTags) {
                const groupId = groupData.dataValues.id;
                const horizontalTagsData = await Promise.all(
                    horizontalTags.map(tag => this.graphHorizontalGroupTagsModel.create({ groupId, labelId: tag })),
                );
                returnData.setHorizontalGroupTags(horizontalTagsData.map(tag => tag.dataValues));
            }
        }
        return returnData.graph;
    }
}
