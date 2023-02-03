import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, ForeignKey, Index, Model, Sequelize, Table } from 'sequelize-typescript';

export type IUserGroup = InferAttributes<UserGroupModel>

@Table({
    tableName: 'user_group',
    timestamps: false,
})
export class UserGroupModel extends Model<InferCreationAttributes<UserGroupModel>, IUserGroup> {
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
}
