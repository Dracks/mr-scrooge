import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface authGroupAttributes {
    id?: number;
    name?: string;
}

@Table({
	tableName: "auth_group",
	timestamps: false 
})
export class authGroup extends Model<authGroupAttributes, authGroupAttributes> implements authGroupAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('auth_group_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(150) 
    })
    	name?: string;

}