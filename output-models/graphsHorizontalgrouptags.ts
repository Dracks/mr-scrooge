import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface graphsHorizontalgrouptagsAttributes {
    id?: number;
    groupId?: number;
    tagId?: number;
}

@Table({
	tableName: "graphs_horizontalgrouptags",
	timestamps: false 
})
export class graphsHorizontalgrouptags extends Model<graphsHorizontalgrouptagsAttributes, graphsHorizontalgrouptagsAttributes> implements graphsHorizontalgrouptagsAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('graphs_horizontalgrouptags_id_seq'::regclass)") 
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