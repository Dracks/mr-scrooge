import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface managementFilterAttributes {
    id?: number;
    typeConditional?: string;
    conditional?: string;
    tagId?: number;
}

@Table({
	tableName: "management_filter",
	timestamps: false 
})
export class managementFilter extends Model<managementFilterAttributes, managementFilterAttributes> implements managementFilterAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('management_filter_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	field: "type_conditional",
    	allowNull: true,
    	type: DataType.STRING(1) 
    })
    	typeConditional?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(200) 
    })
    	conditional?: string;

    @Column({
    	field: "tag_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	tagId?: number;

}