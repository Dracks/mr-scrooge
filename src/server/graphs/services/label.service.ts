import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';

import { ILabel, LabelModel, LabelTransactionModel } from '../models/label.model';

@Injectable()
export class LabelService {
    constructor(
        @InjectModel(LabelModel) private readonly label: typeof LabelModel,
        @InjectModel(LabelTransactionModel) private readonly labelTransaction: typeof LabelTransactionModel,
        ) {}
        
        async createLabel(label: CreationAttributes<LabelModel>): Promise<LabelModel> {
            return this.label.create(label);
        }
        
        async addTransaction(labelTransaction: CreationAttributes<LabelTransactionModel>) {
            return this.labelTransaction.create(labelTransaction);
        }


        async getAll(groupOwnerId: number): Promise<ILabel[]> {
            const labels = await this.label.findAll({where: {groupOwnerId: groupOwnerId}})
            return labels.map(label => label.dataValues);
        }
}
