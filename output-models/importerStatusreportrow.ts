import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface importerStatusreportrowAttributes {
    id?: number;
    movementName?: string;
    date?: string;
    dateValue?: string;
    details?: string;
    value?: number;
    message?: string;
    reportId?: number;
    rawDataId?: number;
}

@Table({
	tableName: "importer_statusreportrow",
	timestamps: false 
})
export class importerStatusreportrow extends Model<importerStatusreportrowAttributes, importerStatusreportrowAttributes> implements importerStatusreportrowAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('importer_statusreportrow_id_seq'::regclass)") 
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
    	type: DataType.STRING 
    })
    	message?: string;

    @Column({
    	field: "report_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	reportId?: number;

    @Column({
    	field: "raw_data_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	rawDataId?: number;

}