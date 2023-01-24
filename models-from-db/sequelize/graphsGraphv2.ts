import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface graphsGraphv2Attributes {
    id?: number;
    name?: string;
    kind?: string;
    dateRange?: string;
    oldGraphId?: number;
    tagFilterId?: number;
}

@Table({
	tableName: "graphs_graphv2",
	timestamps: false 
})
export class graphsGraphv2 extends Model<graphsGraphv2Attributes, graphsGraphv2Attributes> implements graphsGraphv2Attributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('graphs_graphv2_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	name?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(10) 
    })
    	kind?: string;

    @Column({
    	field: "date_range",
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	dateRange?: string;

    @Column({
    	field: "old_graph_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	oldGraphId?: number;

    @Column({
    	field: "tag_filter_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	tagFilterId?: number;

}