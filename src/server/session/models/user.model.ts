import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, ForeignKey, Index, Model, PrimaryKey, Sequelize, Table } from 'sequelize-typescript';

import { UserGroupModel } from './group.model';

export type IUserModel = InferAttributes<UserModel>;

@Table({
    tableName: 'session_user',
    timestamps: false,
})
export class UserModel extends Model<IUserModel, InferCreationAttributes<UserModel>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        unique: true,
        type: DataType.INTEGER,
    })
    id!: CreationOptional<number>;

    @Column({
        field: 'default_group_id',
        type: DataType.INTEGER,
    })
    @ForeignKey(() => UserGroupModel)
    defaultGroupId?: UserGroupModel['id'];

    @Column({
        allowNull: false,
        type: DataType.STRING(128),
    })
    password!: string;

    @Column({
        field: 'last_login',
        allowNull: true,
        type: DataType.DATE,
    })
    lastLogin?: Date;

    @Column({
        field: 'is_superuser',
        allowNull: false,
        type: DataType.BOOLEAN,
    })
    isSuperuser!: boolean;

    @Column({
        allowNull: false,
        type: DataType.STRING(150),
    })
    username!: string;

    @Column({
        field: 'first_name',
        allowNull: false,
        type: DataType.STRING(150),
    })
    firstName!: string;

    @Column({
        field: 'last_name',
        allowNull: false,
        type: DataType.STRING(150),
    })
    lastName!: string;

    @Column({
        allowNull: false,
        type: DataType.STRING(254),
    })
    email!: string;

    @Column({
        field: 'is_staff',
        allowNull: false,
        type: DataType.BOOLEAN,
    })
    isStaff!: boolean;

    @Column({
        field: 'is_active',
        allowNull: false,
        type: DataType.BOOLEAN,
    })
    isActive!: boolean;

    @Column({
        field: 'date_joined',
        allowNull: false,
        type: DataType.DATE,
    })
    dateJoined!: Date;
}
