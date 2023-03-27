/* eslint-disable no-use-before-define */
import { Attributes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import {
    Column,
    DataType,
    ForeignKey,
    Index,
    Model,
    Table,
} from 'sequelize-typescript';

import { UserGroupModel } from '../../session/models/group.model';

@Table({
    tableName: 'core_bank_transaction',
    timestamps: false,
    indexes: [{ name: 'cursor', fields: ['group_owner_id', 'date', 'id'] }],
})
export class BankTransaction extends Model<InferAttributes<BankTransaction>, InferCreationAttributes<BankTransaction>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id!: CreationOptional<number>;

    @ForeignKey(() => UserGroupModel)
    @Column({ allowNull: false, field: 'group_owner_id', type: DataType.INTEGER })
    groupOwnerId!: UserGroupModel['id'];

    @Column({
        field: 'movement_name',
        type: DataType.STRING(255),
        allowNull: false,
    })
    movementName!: string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
    })
    @Index
    date!: string;

    @Column({
        field: 'date_value',
        allowNull: true,
        type: DataType.DATEONLY,
    })
    dateValue?: string;

    @Column({
        allowNull: true,
        type: DataType.STRING,
    })
    details?: string;

    @Column({
        type: DataType.DOUBLE,
        allowNull: false,
    })
    value!: number;

    @Column({
        allowNull: false,
        type: DataType.STRING(255),
    })
    kind!: string;

    @Column({
        allowNull: true,
        type: DataType.STRING,
    })
    description?: string;

    @Column({
        field: 'page_key',
        allowNull: false,
        type: DataType.STRING(255),
    })
    pageKey!: string;
}

export type IBankTransaction = Attributes<BankTransaction>;
