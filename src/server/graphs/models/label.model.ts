/* eslint-disable no-use-before-define */
import { Attributes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { BankTransaction } from '../../bank-transaction/models/bank-transaction.model';
import { UserGroupModel } from '../../session/models/group.model';

@Table({
    tableName: 'graph_label',
    timestamps: false,
})
export class LabelModel extends Model<InferAttributes<LabelModel>, InferCreationAttributes<LabelModel>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id!: CreationOptional<number>;

    @Column({
        allowNull: false,
        field: 'group_owner_id',
        type: DataType.INTEGER,
    })
    @ForeignKey(() => UserGroupModel)
    groupOwnerId!: UserGroupModel['id'];

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    name!: string;
}

@Table({
    tableName: 'graph_label_transaction',
    timestamps: false,
})
export class LabelTransactionModel extends Model<
    InferAttributes<LabelTransactionModel>,
    InferCreationAttributes<LabelTransactionModel>
> {
    @Column({ type: DataType.NUMBER })
    @ForeignKey(() => LabelModel)
    labelId!: LabelModel['id'];

    @Column({ type: DataType.NUMBER })
    @ForeignKey(() => BankTransaction)
    transactionId!: BankTransaction['id'];
}

export type ILabel = Attributes<LabelModel>;
