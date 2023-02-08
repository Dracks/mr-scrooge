import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { UserGroupModel } from "../../session/models/group.model";

export type IConditionAttributes = InferAttributes<ConditionModel>

export enum FilterConditionals{
    CONTAINS = "c",
    PREFIX = "p",
    SUFFIX = "s",
    GREATER = "g",
    GREATER_EQUAL = "G",
    LOWER_EQUAL = "L",
    LOWER = "l",
    REGULAR_EXPRESION = "r",
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