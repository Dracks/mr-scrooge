import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface authUserGroupsAttributes {
    id?: number;
    userId?: number;
    groupId?: number;
}

@Table({
	tableName: "auth_user_groups",
	timestamps: false 
})
export class authUserGroups extends Model<authUserGroupsAttributes, authUserGroupsAttributes> implements authUserGroupsAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('auth_user_groups_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	field: "user_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	userId?: number;

    @Column({
    	field: "group_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	groupId?: number;

}