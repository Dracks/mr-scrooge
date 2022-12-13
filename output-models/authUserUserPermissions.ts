import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface authUserUserPermissionsAttributes {
    id?: number;
    userId?: number;
    permissionId?: number;
}

@Table({
	tableName: "auth_user_user_permissions",
	timestamps: false 
})
export class authUserUserPermissions extends Model<authUserUserPermissionsAttributes, authUserUserPermissionsAttributes> implements authUserUserPermissionsAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('auth_user_user_permissions_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	field: "user_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	userId?: number;

    @Column({
    	field: "permission_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	permissionId?: number;

}