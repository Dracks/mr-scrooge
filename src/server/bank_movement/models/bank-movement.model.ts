import { Column, DataType, Model, Sequelize, Table } from "sequelize-typescript";

export interface BankMovementAttributes {
    id?: number;
    movementName: string;
    date: Date;
    dateValue?: Date;
    details?: string;
    value: number
    kind: string;
    description?: string
    pageKey: string
}



@Table({
	tableName: "core_rawdatasource",
	timestamps: false,
	indexes: [
		{
            fields: ["kind", 'movementName', 'date', 'value']
        },
		{
			fields: ['date', 'id']
		}
    ]
})
export class BankMovement extends Model<BankMovementAttributes, BankMovementAttributes> implements BankMovementAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    })
    	id?: number;

    @Column({
    	field: "movement_name",
    	type: DataType.STRING(255) 
    })
    	movementName!: string;

    @Column({
    	type: DataType.DATEONLY
    })
    	date!: Date;

    @Column({
    	field: "date_value",
    	allowNull: true,
    	type: DataType.DATEONLY 
    })
    	dateValue?: Date;

    @Column({
    	allowNull: true,
    	type: DataType.STRING 
    })
    	details?: string;

    @Column({
    	type: DataType.DOUBLE 
    })
    	value!: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	kind!: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING 
    })
    	description?: string;

    @Column({
    	field: "page_key",
    	type: DataType.STRING(255) 
    })
    	pageKey!: string;

}