import {
Column, DataType, ForeignKey, 
Index, 	Model, Sequelize, Table} from "sequelize-typescript";

export interface UserModelAttributes {
    dateJoined: Date;
    email: string;
    firstName: string;
    id?: number;
    isActive: boolean;
    isStaff?: boolean;
    isSuperuser: boolean;
    lastLogin?: Date;
    lastName: string;
    password?: string;
    username?: string;
}

@Table({
	tableName: "auth_user",
	timestamps: false 
})
export class UserModel extends Model<UserModelAttributes, UserModelAttributes> implements UserModelAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
		unique: true,
    	type: DataType.INTEGER,
    })
    	id!: number;

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
    	allowNull: false,
    	type: DataType.BOOLEAN 
    })
    	isSuperuser!: boolean;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(150) 
    })
    	username?: string;

    @Column({
    	field: "first_name",
    	allowNull: false,
    	type: DataType.STRING(150) 
    })
    	firstName!: string;

    @Column({
    	field: "last_name",
    	allowNull: false,
    	type: DataType.STRING(150) 
    })
    	lastName!: string;

    @Column({
    	allowNull: false,
    	type: DataType.STRING(254) 
    })
    	email!: string;

    @Column({
    	field: "is_staff",
    	allowNull: true,
    	type: DataType.BOOLEAN 
    })
    	isStaff?: boolean;

    @Column({
    	field: "is_active",
    	allowNull: false,
    	type: DataType.BOOLEAN 
    })
    	isActive!: boolean;

    @Column({
    	field: "date_joined",
    	allowNull: false,
    	type: DataType.DATE 
    })
    	dateJoined!: Date;

}