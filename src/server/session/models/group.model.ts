import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface authGroupAttributes {
    id?: number;
    name: string;
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
    })
    	id?: number;

    @Column({
    	allowNull: false,
    	type: DataType.STRING(150) 
    })
    	name!: string;

}
