import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface authUserAttributes {
    id?: number;
    password?: string;
    lastLogin?: Date;
    isSuperuser?: boolean;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    isStaff?: boolean;
    isActive?: boolean;
    dateJoined?: Date;
}

@Table({
	tableName: "auth_user",
	timestamps: false 
})
export class UserModel extends Model<authUserAttributes, authUserAttributes> implements authUserAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('auth_user_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(128) 
    })
    	password?: string;

    @Column({
    	field: "last_login",
    	allowNull: true,
    	type: DataType.DATE 
    })
    	lastLogin?: Date;

    @Column({
    	field: "is_superuser",
    	allowNull: true,
    	type: DataType.BOOLEAN 
    })
    	isSuperuser?: boolean;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(150) 
    })
    	username?: string;

    @Column({
    	field: "first_name",
    	allowNull: true,
    	type: DataType.STRING(150) 
    })
    	firstName?: string;

    @Column({
    	field: "last_name",
    	allowNull: true,
    	type: DataType.STRING(150) 
    })
    	lastName?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(254) 
    })
    	email?: string;

    @Column({
    	field: "is_staff",
    	allowNull: true,
    	type: DataType.BOOLEAN 
    })
    	isStaff?: boolean;

    @Column({
    	field: "is_active",
    	allowNull: true,
    	type: DataType.BOOLEAN 
    })
    	isActive?: boolean;

    @Column({
    	field: "date_joined",
    	allowNull: true,
    	type: DataType.DATE 
    })
    	dateJoined?: Date;

}