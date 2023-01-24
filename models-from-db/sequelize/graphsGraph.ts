import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface graphsGraphAttributes {
    id?: number;
    name?: string;
    kind?: string;
    options?: string;
}

@Table({
	tableName: "graphs_graph",
	timestamps: false 
})
export class graphsGraph extends Model<graphsGraphAttributes, graphsGraphAttributes> implements graphsGraphAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('graphs_graph_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	name?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(50) 
    })
    	kind?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING 
    })
    	options?: string;

}