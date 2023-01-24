import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface authPermissionAttributes {
    id?: number;
    name?: string;
    contentTypeId?: number;
    codename?: string;
}

@Table({
	tableName: "auth_permission",
	timestamps: false 
})
export class authPermission extends Model<authPermissionAttributes, authPermissionAttributes> implements authPermissionAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('auth_permission_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	name?: string;

    @Column({
    	field: "content_type_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	contentTypeId?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(100) 
    })
    	codename?: string;

}