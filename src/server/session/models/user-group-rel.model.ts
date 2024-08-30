/* eslint-disable no-use-before-define */
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { UserGroupModel } from './group.model';
import { UserModel } from './user.model';

@Table({
    tableName: 'user_group_rel',
    timestamps: false,
    indexes: [{ fields: ['user_id', 'user_group_id'], unique: true }],
})
export class UserGroupRelModel extends Model<
    InferAttributes<UserGroupRelModel>,
    InferCreationAttributes<UserGroupRelModel>
> {
    @ForeignKey(() => UserGroupModel)
    @Column({
        allowNull: false,
        type: DataType.INTEGER,
        field: 'user_group_id',
    })
    userGroupId!: UserGroupModel['id'];

    @ForeignKey(() => UserModel)
    @Column({
        allowNull: false,
        type: DataType.INTEGER,
        field: 'user_id',
    })
    userId!: UserModel['id'];
}
