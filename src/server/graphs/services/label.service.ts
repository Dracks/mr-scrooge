import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';

import { queryOwnerId } from '../../session/db-query';
import { ILabel, LabelModel, LabelTransactionModel } from '../models/label.model';

@Injectable()
export class LabelService {
    constructor(
        @InjectModel(LabelModel) private readonly label: typeof LabelModel,
        @InjectModel(LabelTransactionModel) private readonly labelTransaction: typeof LabelTransactionModel,
        ) {}

        createLabel(label: CreationAttributes<LabelModel>): Promise<LabelModel> {
            return this.label.create(label);
        }

        addTransaction(labelTransaction: CreationAttributes<LabelTransactionModel>) {
            return this.labelTransaction.create(labelTransaction);
        }


        async getAll(groupsId: number[]): Promise<ILabel[]> {
            const labels = await this.label.findAll({where: queryOwnerId(groupsId)})
            return labels.map(label => label.dataValues);
        }

        async getLabelsIdForTransaction(transactionId: number): Promise<number[]>{
            const labelsRelation = await this.labelTransaction.findAll({where: {transactionId}})
            return labelsRelation.map(({labelId})=>labelId)
        }
}