/* eslint-disable no-use-before-define */
import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, Model, Table } from 'sequelize-typescript';


export type IConditionAttributes = InferAttributes<ConditionModel>;

export enum FilterConditionals {
    CONTAINS = 'c',
    GREATER = 'g',
    GREATER_EQUAL = 'G',
    LOWER = 'l',
    LOWER_EQUAL = 'L',
    PREFIX = 'p',
    REGULAR_EXPRESION = 'r',
    SUFFIX = 's'
}

@Table({
    tableName: 'core_condition',
    timestamps: false,
})
export class ConditionModel extends Model<IConditionAttributes, InferCreationAttributes<ConditionModel>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id!: CreationOptional<number>;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    name!: string;
}
