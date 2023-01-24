import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface graphsGroupAttributes {
    id?: number;
    group?: string;
    hideOthers?: boolean;
    graphId?: number;
}

@Table({
	tableName: "graphs_group",
	timestamps: false 
})
export class graphsGroup extends Model<graphsGroupAttributes, graphsGroupAttributes> implements graphsGroupAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('graphs_group_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(10) 
    })
    	group?: string;

    @Column({
    	field: "hide_others",
    	allowNull: true,
    	type: DataType.BOOLEAN 
    })
    	hideOthers?: boolean;

    @Column({
    	field: "graph_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	graphId?: number;

}