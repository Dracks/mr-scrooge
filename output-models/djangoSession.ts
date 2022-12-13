import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface djangoSessionAttributes {
    sessionKey: string;
    sessionData?: string;
    expireDate?: Date;
}

@Table({
	tableName: "django_session",
	timestamps: false 
})
export class djangoSession extends Model<djangoSessionAttributes, djangoSessionAttributes> implements djangoSessionAttributes {

    @Column({
    	field: "session_key",
    	primaryKey: true,
    	type: DataType.STRING(40) 
    })
    	sessionKey!: string;

    @Column({
    	field: "session_data",
    	allowNull: true,
    	type: DataType.STRING 
    })
    	sessionData?: string;

    @Column({
    	field: "expire_date",
    	allowNull: true,
    	type: DataType.DATE 
    })
    	expireDate?: Date;

}