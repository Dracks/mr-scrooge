import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, ForeignKey, Index, Model, Sequelize, Table } from 'sequelize-typescript';

import { UserModel } from './user.model';

export type IUserGroup = InferAttributes<UserGroupModel>;

@Table({
    tableName: 'user_group',
    timestamps: false,
})
export class UserGroupModel extends Model<IUserGroup, InferCreationAttributes<UserGroupModel>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id!: CreationOptional<number>;

    @Column({
        allowNull: false,
        type: DataType.STRING(150),
    })
    name!: string;

    @Column({
        allowNull: false,
        type: DataType.INTEGER,
    })
    @ForeignKey(() => UserModel)
    ownerId!: number;
}
