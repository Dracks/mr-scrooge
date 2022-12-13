import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface djangoSessionAttributes {
    sessionKey: string;
    expireDate?: Date;
}

@Table({
	tableName: "user_session",
	timestamps: false 
})
export class Session extends Model<djangoSessionAttributes, djangoSessionAttributes> implements djangoSessionAttributes {

    @Column({
    	field: "session_key",
    	primaryKey: true,
    	type: DataType.STRING(40) 
    })
    	sessionKey!: string;


    @Column({
    	field: "expire_date",
    	allowNull: true,
    	type: DataType.DATE 
    })
    	expireDate?: Date;

}