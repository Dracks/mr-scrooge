import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface importerStatusreportAttributes {
    id?: number;
    kind?: string;
    date?: Date;
    fileName?: string;
    status?: string;
    description?: string;
}

@Table({
	tableName: "importer_statusreport",
	timestamps: false 
})
export class importerStatusreport extends Model<importerStatusreportAttributes, importerStatusreportAttributes> implements importerStatusreportAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('importer_statusreport_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	kind?: string;

    @Column({
    	allowNull: true,
    	type: DataType.DATE 
    })
    	date?: Date;

    @Column({
    	field: "file_name",
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	fileName?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(1) 
    })
    	status?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING 
    })
    	description?: string;

}