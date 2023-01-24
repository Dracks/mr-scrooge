import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface djangoAdminLogAttributes {
    id?: number;
    actionTime?: Date;
    objectId?: string;
    objectRepr?: string;
    actionFlag?: number;
    changeMessage?: string;
    contentTypeId?: number;
    userId?: number;
}

@Table({
	tableName: "django_admin_log",
	timestamps: false 
})
export class djangoAdminLog extends Model<djangoAdminLogAttributes, djangoAdminLogAttributes> implements djangoAdminLogAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('django_admin_log_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	field: "action_time",
    	allowNull: true,
    	type: DataType.DATE 
    })
    	actionTime?: Date;

    @Column({
    	field: "object_id",
    	allowNull: true,
    	type: DataType.STRING 
    })
    	objectId?: string;

    @Column({
    	field: "object_repr",
    	allowNull: true,
    	type: DataType.STRING(200) 
    })
    	objectRepr?: string;

    @Column({
    	field: "action_flag",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	actionFlag?: number;

    @Column({
    	field: "change_message",
    	allowNull: true,
    	type: DataType.STRING 
    })
    	changeMessage?: string;

    @Column({
    	field: "content_type_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	contentTypeId?: number;

    @Column({
    	field: "user_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	userId?: number;

}