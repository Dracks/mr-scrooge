import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface graphsHorizontalgroupAttributes {
    id?: number;
    group?: string;
    hideOthers?: boolean;
    accumulate?: boolean;
    graphId?: number;
}

@Table({
	tableName: "graphs_horizontalgroup",
	timestamps: false 
})
export class graphsHorizontalgroup extends Model<graphsHorizontalgroupAttributes, graphsHorizontalgroupAttributes> implements graphsHorizontalgroupAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('graphs_horizontalgroup_id_seq'::regclass)") 
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
    	allowNull: true,
    	type: DataType.BOOLEAN 
    })
    	accumulate?: boolean;

    @Column({
    	field: "graph_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	graphId?: number;

}