/* eslint-disable no-use-before-define */
import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';

import { UserGroupModel } from '../../session/models/group.model';
import { ConditionModel } from './condition.model';

export enum ConditionalRelationType {
    and = 'and',
    notOr = 'notOr',
}

export type IRuleAttributes = InferAttributes<RuleModel>;

@Table({
    tableName: 'core_rule',
    timestamps: false,
})
export class RuleModel extends Model<IRuleAttributes, InferCreationAttributes<RuleModel>> {
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

    @HasMany(() => ConditionModel)
    conditions?: ConditionModel[];

    @Column({
        type: DataType.CHAR(10),
        allowNull: false,
        defaultValue: ConditionalRelationType.and,
        values: Object.values(ConditionalRelationType),
    })
    conditionsRelation?: ConditionalRelationType;

    @HasMany(() => RuleModel, { foreignKey: 'parent' })
    children?: RuleModel;

    @Column({
        type: DataType.INTEGER,
    })
    @ForeignKey(() => RuleModel)
    parent?: RuleModel;
}
