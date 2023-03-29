import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Attributes, CreationAttributes, FindOptions, InferAttributes, Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript'

import { listToDictionary, listToDictionaryList } from '../../common/list-to-dictionary';
import { CustomError, ensureOrThrow } from '../../core/errors/base-error';
import { queryOwnerId } from '../../session/db-query';
import { UpdatedGraph } from '../gql-objects/graph.input';
import {
    GraphGroupLabelsModel,
    GraphGroupModel,
    GraphHorizontalGroupLabelsModel,
    GraphHorizontalGroupModel,
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

    setGroupLabels(groupTags: InferAttributes<GraphGroupLabelsModel>[]) {
        this.graph.group.labels = groupTags.map(tag => tag.labelId);
    }

    setHorizontalGroup(horizontalGroup: InferAttributes<GraphHorizontalGroupModel>) {
        this.graph.horizontalGroup = horizontalGroup;
    }

    setHorizontalGroupLabels(groupTags: InferAttributes<GraphHorizontalGroupLabelsModel>[]) {
        if (!this.graph.horizontalGroup) {
            throw new Error(`Graph horizontal group should be defined before setting group tags`);
        }
        this.graph.horizontalGroup.labels = groupTags.map(tag => tag.labelId);
    }
}

@Injectable()
export class GraphService {
    readonly logger = new Logger()

    constructor(
        private readonly sequelize: Sequelize,
        @InjectModel(GraphModel) private readonly graphModel: typeof GraphModel,
        @InjectModel(GraphGroupModel) private readonly graphGroupModel: typeof GraphGroupModel,
        @InjectModel(GraphGroupLabelsModel) private readonly graphGroupLabelsModel: typeof GraphGroupLabelsModel,
        @InjectModel(GraphHorizontalGroupModel)
        private readonly graphHorizontalGroupModel: typeof GraphHorizontalGroupModel,
        @InjectModel(GraphHorizontalGroupLabelsModel)
        private readonly graphHorizontalGroupLabelsModel: typeof GraphHorizontalGroupLabelsModel,
    ) {}

    // eslint-disable-next-line class-methods-use-this
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

    private addGroupLabels(graphId: number, labels: number[], transaction?: Transaction){
        return Promise.all(
            labels.map((labelId, order) => this.graphGroupLabelsModel.create({ graphId, labelId, order }, {transaction})),
        );
    }

    private addHorizontalGroupLabels(graphId: number, labels: number[], transaction?: Transaction){
        return Promise.all(
            labels.map((labelId, order) => this.graphHorizontalGroupLabelsModel.create({ graphId, labelId, order }, {transaction})),
        );
    }

    async createGraph({ group: { labels: groupLabels, ...group }, horizontalGroup, ...graph }: NewGraph) {
        const graphData = await this.graphModel.create(graph);
        const graphId = graphData.dataValues.id;
        const groupData = await this.graphGroupModel.create({
            ...group,
            graphId,
        });

        const returnData = new GraphBuilder(graphData.dataValues, groupData.dataValues);

        if (groupLabels) {
            const groupTagsData = await this.addGroupLabels(graphId, groupLabels)
            returnData.setGroupLabels(groupTagsData.map(tag => tag.dataValues));
        }
        if (horizontalGroup) {
            const { labels: horizontalTags, ...newHorizontalGroup } = horizontalGroup;
            const horizontalGroupData = await this.graphHorizontalGroupModel.create({
                ...newHorizontalGroup,
                graphId,
            });
            returnData.setHorizontalGroup(horizontalGroupData.dataValues);

            if (horizontalTags) {
                const horizontalTagsData = await this.addHorizontalGroupLabels(graphId, horizontalTags)
                returnData.setHorizontalGroupLabels(horizontalTagsData.map(tag => tag.dataValues));
            }
        }
        return returnData.graph;
    }

    async updateGraph(updatedGraph: UpdatedGraph) {
        const { id, group: {labels: groupLabels, ...group}, horizontalGroup, ...graph } = updatedGraph
        const transaction = await this.sequelize.transaction()
        try {
            await this.graphModel.update(graph, {where: {id}, transaction})
            await this.graphGroupModel.update(group, {where: {graphId: id}, transaction})
            await this.graphGroupLabelsModel.destroy({where: {graphId: id}, transaction })
            if (groupLabels){
                await this.addGroupLabels(id, groupLabels, transaction)
            }

            await this.graphHorizontalGroupLabelsModel.destroy({where: {graphId: id}, transaction})
            if (horizontalGroup){
                const horizontalDb = await this.graphHorizontalGroupModel.findOne({where: {graphId: id}})
                if (horizontalDb){
                    await horizontalDb.update(horizontalGroup, {transaction})
                } else {
                    await this.graphHorizontalGroupModel.create({graphId: id, ...horizontalGroup}, {transaction})
                }
            } else {
                await this.graphHorizontalGroupModel.destroy({where: {id}, transaction})
            }
            await transaction.commit()
        } catch (err){
            await transaction.rollback()
            this.logger.error({error: err}, `Error updating graph ${id}`)
            throw err
        }
        return this.getGraphById(id)
    }

    async getGraphById(graphId: number) {
        const where = {graphId}
        const graph = ensureOrThrow(await this.graphModel.findByPk(graphId), new CustomError('ER0002', 'Graph not found in database', {graphId}))
        const group = ensureOrThrow(await this.graphGroupModel.findByPk(graphId), new CustomError('ER0003', 'Graph group not found in database', {graphId}))
        const groupLabels = await this.graphGroupLabelsModel.findAll({where})
        const horizontal = await this.graphHorizontalGroupModel.findByPk(graphId)
        const horizontalLabels = await this.graphHorizontalGroupLabelsModel.findAll({where})

        const builder = new GraphBuilder(graph.dataValues, group.dataValues)
        if (groupLabels.length>0){
            builder.setGroupLabels(groupLabels)
        }
        if (horizontal){
            builder.setHorizontalGroup(horizontal.dataValues)
            if (horizontalLabels.length>0){
                builder.setHorizontalGroupLabels(horizontalLabels)
            }
        }
        return builder.graph
    }

    async getGraphsId(groupsId: number[]) {
        const graphsList = await this.graphModel.findAll({where: queryOwnerId(groupsId)})
        return graphsList.map(graph => graph.id);
    }

    async getGraphs(groupsId: number[], filterGraphsIds?: number[]): Promise<Graph[]>{
        const firstQuery : FindOptions<Attributes<GraphModel>> = {where: queryOwnerId(groupsId)}
        if (filterGraphsIds && filterGraphsIds.length>0){
            firstQuery.where = {
                [Op.and]: [
                    queryOwnerId(groupsId),
                    {id: {[Op.in]: filterGraphsIds}},
                ]
            }
        }
        const graphsList = await this.graphModel.findAll(firstQuery)
        const graphsIds = graphsList.map(graph => graph.id)
        // Retrieve all related data for the graphs
        const where = {graphId: {[Op.in]: graphsIds}}
        const groupsList = await this.graphGroupModel.findAll({where})
        const groupsTagsList = await this.graphGroupLabelsModel.findAll({where})
        const horizontalList = await this.graphHorizontalGroupModel.findAll({where})
        const horizontalTagsList = await this.graphHorizontalGroupLabelsModel.findAll({where})

        // Generate some dictionaries to found the data for every graphId
        const groupsMap = listToDictionary(groupsList.map(elem => elem.dataValues), 'graphId')
        const groupsTagsMap = listToDictionaryList(groupsTagsList.map(elem => elem.dataValues), 'graphId')
        const horizontalMap = listToDictionary(horizontalList.map(elem => elem.dataValues), 'graphId')
        const horizontalTagsMap = listToDictionaryList(horizontalTagsList.map(elem => elem.dataValues), 'graphId')

        return Promise.all(graphsList.map(graph =>{
            const graphId = graph.id

            const graphBuilder = new GraphBuilder(graph.dataValues, groupsMap[graphId]);
            if (groupsTagsMap[graphId]){
                graphBuilder.setGroupLabels(groupsTagsMap[graphId])
            }
            if (horizontalMap[graphId]){
                graphBuilder.setHorizontalGroup(horizontalMap[graphId])
                if (horizontalTagsMap[graphId]){
                    graphBuilder.setHorizontalGroupLabels(horizontalTagsMap[graphId])
                }
            }
            return graphBuilder.graph
        }))
    }


}
