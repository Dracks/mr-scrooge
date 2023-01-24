import { Column, DataType, ForeignKey, Index, Model, Sequelize, Table, PrimaryKey } from 'sequelize-typescript';
import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

export type IUserModel = InferAttributes<UserModel>;

@Table({
    tableName: 'auth_user',
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