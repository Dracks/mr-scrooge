import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface authGroupPermissionsAttributes {
    id?: number;
    groupId?: number;
    permissionId?: number;
}

@Table({
	tableName: "auth_group_permissions",
	timestamps: false 
})
export class authGroupPermissions extends Model<authGroupPermissionsAttributes, authGroupPermissionsAttributes> implements authGroupPermissionsAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('auth_group_permissions_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	field: "group_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	groupId?: number;

    @Column({
    	field: "permission_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	permissionId?: number;

}