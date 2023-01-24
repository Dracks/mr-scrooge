import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface managementValuestotagAttributes {
    id?: number;
    enable?: number;
    automatic?: number;
    rawDataSourceId?: number;
    tagId?: number;
}

@Table({
	tableName: "management_valuestotag",
	timestamps: false 
})
export class managementValuestotag extends Model<managementValuestotagAttributes, managementValuestotagAttributes> implements managementValuestotagAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('management_valuestotag_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	enable?: number;

    @Column({
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	automatic?: number;

    @Column({
    	field: "raw_data_source_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	rawDataSourceId?: number;

    @Column({
    	field: "tag_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	tagId?: number;

}