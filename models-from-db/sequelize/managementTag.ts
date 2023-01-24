import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface managementTagAttributes {
    id?: number;
    name?: string;
    negateConditional?: boolean;
    parentId?: number;
}

@Table({
	tableName: "management_tag",
	timestamps: false 
})
export class managementTag extends Model<managementTagAttributes, managementTagAttributes> implements managementTagAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('management_tag_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(200) 
    })
    	name?: string;

    @Column({
    	field: "negate_conditional",
    	allowNull: true,
    	type: DataType.BOOLEAN 
    })
    	negateConditional?: boolean;

    @Column({
    	field: "parent_id",
    	allowNull: true,
    	type: DataType.INTEGER 
    })
    	parentId?: number;

}