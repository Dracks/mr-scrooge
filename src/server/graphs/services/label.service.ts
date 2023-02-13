import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';

import { LabelModel, LabelTransactionModel } from '../models/label.model';

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
}
