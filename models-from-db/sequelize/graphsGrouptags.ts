import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface graphsGrouptagsAttributes {
    id?: number;
    groupId?: number;
    tagId?: number;
}

@Table({
	tableName: "graphs_grouptags",
	timestamps: false 
})
export class graphsGrouptags extends Model<graphsGrouptagsAttributes, graphsGrouptagsAttributes> implements graphsGrouptagsAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('graphs_grouptags_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	field: "group_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	groupId?: number;

    @Column({
    	field: "tag_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	tagId?: number;

}