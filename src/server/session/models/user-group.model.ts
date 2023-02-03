import { Column, DataType, ForeignKey, Index, Model, Sequelize, Table } from 'sequelize-typescript';

export interface authUserGroupsAttributes {
    groupId: number;
    id?: number;
    userId: number;
}

@Table({
    tableName: 'auth_user_groups',
    timestamps: false,
})
export class authUserGroups
    extends Model<authUserGroupsAttributes, authUserGroupsAttributes>
    implements authUserGroupsAttributes
{
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id?: number;

    @Column({
        field: 'user_id',
        allowNull: false,
        type: DataType.INTEGER,
    })
    userId!: number;

    @Column({
        field: 'group_id',
        allowNull: false,
        type: DataType.INTEGER,
    })
    groupId!: number;
}
