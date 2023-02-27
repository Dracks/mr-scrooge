import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, InferAttributes, InferCreationAttributes, Op } from 'sequelize';
import { listToDictionary, listToDictionaryList } from '../../common/list-to-dictionary';
import { queryOwnerId } from '../../session/db-query';

import {
    GraphGroupModel,
    GraphGroupLabelsModel,
    GraphHorizontalGroupModel,
    GraphHorizontalGroupLabelsModel,
    GraphModel,
} from '../models/graph.model';

export interface NewGraph extends CreationAttributes<GraphModel> {
    group: CreationAttributes<GraphGroupModel> & { labels?: number[] };
    horizontalGroup?: CreationAttributes<GraphHorizontalGroupModel> & { labels?: number[] };
}

export interface Graph extends InferAttributes<GraphModel> {
    group: Omit<InferAttributes<GraphGroupModel>, 'graphId'> & { labels?: number[] };
    horizontalGroup?: Omit<InferAttributes<GraphHorizontalGroupModel>, 'graphId'> & { labels?: number[] };
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

    setGroupTags(groupTags: InferAttributes<GraphGroupLabelsModel>[]) {
        this.graph.group.labels = groupTags.map(tag => tag.labelId);
    }

    setHorizontalGroup(horizontalGroup: InferAttributes<GraphHorizontalGroupModel>) {
        this.graph.horizontalGroup = horizontalGroup;
    }

    setHorizontalGroupTags(groupTags: InferAttributes<GraphHorizontalGroupLabelsModel>[]) {
        if (!this.graph.horizontalGroup) {
            throw new Error(`Graph horizontal group should be defined before setting group tags`);
        }
        this.graph.horizontalGroup.labels = groupTags.map(tag => tag.labelId);
    }
}

@Injectable()
export class GraphService {
    constructor(
        @InjectModel(GraphModel) private readonly graphModel: typeof GraphModel,
        @InjectModel(GraphGroupModel) private readonly graphGroupModel: typeof GraphGroupModel,
        @InjectModel(GraphGroupLabelsModel) private readonly graphGroupLabelsModel: typeof GraphGroupLabelsModel,
        @InjectModel(GraphHorizontalGroupModel)
        private readonly graphHorizontalGroupModel: typeof GraphHorizontalGroupModel,
        @InjectModel(GraphHorizontalGroupLabelsModel)
        private readonly graphHorizontalGroupLabelsModel: typeof GraphHorizontalGroupLabelsModel,
    ) {}

    packGraph(
        graph: InferAttributes<GraphModel>,
        group: InferAttributes<GraphGroupModel>,
        groupTags?: InferAttributes<GraphGroupLabelsModel>[],
    ): Graph {
        return {
            ...graph,
            group: {
                ...group,
                labels: groupTags ? groupTags.map(tag => tag.labelId) : undefined,
            },
        };
    }

    async createGraph({ group: { labels: groupTags, ...group }, horizontalGroup, ...graph }: NewGraph) {
        const graphData = await this.graphModel.create(graph);
        const graphId = graphData.dataValues.id;
        const groupData = await this.graphGroupModel.create({
            ...group,
            graphId,
        });

        const returnData = new GraphBuilder(graphData.dataValues, groupData.dataValues);

        if (groupTags) {
            const groupTagsData = await Promise.all(
                groupTags.map((tag, idx) => this.graphGroupLabelsModel.create({ graphId, labelId: tag, position: idx })),
            );
            returnData.setGroupTags(groupTagsData.map(tag => tag.dataValues));
        }
        if (horizontalGroup) {
            const { labels: horizontalTags, ...newHorizontalGroup } = horizontalGroup;
            const horizontalGroupData = await this.graphHorizontalGroupModel.create({
                ...newHorizontalGroup,
                graphId,
            });
            returnData.setHorizontalGroup(horizontalGroupData.dataValues);

            if (horizontalTags) {
                const horizontalTagsData = await Promise.all(
                    horizontalTags.map((tag, idx) => this.graphHorizontalGroupLabelsModel.create({ graphId, labelId: tag, position: idx })),
                );
                returnData.setHorizontalGroupTags(horizontalTagsData.map(tag => tag.dataValues));
            }
        }
        return returnData.graph;
    }

    async getGraphs(groupsId: number[]): Promise<Graph[]>{
        const graphsList = await this.graphModel.findAll({where: queryOwnerId(groupsId)})
        const graphsIds = graphsList.map(graph => graph.id)
        // Retrieve all related data for the graphs
        const where = {graphId: {[Op.in]: graphsIds}}
        const groupsList = await this.graphGroupModel.findAll({where})
        const groupsTagsList = await this.graphGroupLabelsModel.findAll({where, order: [['position', 'ASC']]})
        const horizontalList = await this.graphHorizontalGroupModel.findAll({where})
        const horizontalTagsList = await this.graphHorizontalGroupLabelsModel.findAll({where, order: [['position', 'ASC']]})

        // Generate some dictionaries to found the data for every graphId
        const groupsMap = listToDictionary(groupsList.map(elem => elem.dataValues), 'graphId')
        const groupsTagsMap = listToDictionaryList(groupsTagsList.map(elem => elem.dataValues), 'graphId')
        const horizontalMap = listToDictionary(horizontalList.map(elem => elem.dataValues), 'graphId')
        const horizontalTagsMap = listToDictionaryList(horizontalTagsList.map(elem => elem.dataValues), 'graphId')

        return Promise.all(graphsList.map(graph =>{
            const graphId = graph.id

            const graphBuilder = new GraphBuilder(graph.dataValues, groupsMap[graphId]);
            if (groupsTagsMap[graphId]){
                graphBuilder.setGroupTags(groupsTagsMap[graphId])
            }
            if (horizontalMap[graphId]){
                graphBuilder.setHorizontalGroup(horizontalMap[graphId])
                if (horizontalTagsMap[graphId]){
                    graphBuilder.setHorizontalGroupTags(horizontalTagsMap[graphId])
                }
            }
            return graphBuilder.graph
        }))
    }


}
