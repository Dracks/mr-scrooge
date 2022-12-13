import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface coreRawdatasourceAttributes {
    id?: number;
    movementName?: string;
    date?: string;
    dateValue?: string;
    details?: string;
    value?: number;
    kind?: string;
    description?: string;
    pageKey?: string;
}

@Table({
	tableName: "core_rawdatasource",
	timestamps: false 
})
export class coreRawdatasource extends Model<coreRawdatasourceAttributes, coreRawdatasourceAttributes> implements coreRawdatasourceAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('importer_rawdatasource_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	field: "movement_name",
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	movementName?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING 
    })
    	date?: string;

    @Column({
    	field: "date_value",
    	allowNull: true,
    	type: DataType.STRING 
    })
    	dateValue?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING 
    })
    	details?: string;

    @Column({
    	allowNull: true,
    	type: DataType.DOUBLE 
    })
    	value?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	kind?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING 
    })
    	description?: string;

    @Column({
    	field: "page_key",
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	pageKey?: string;

}