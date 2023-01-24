import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface djangoMigrationsAttributes {
    id?: number;
    app?: string;
    name?: string;
    applied?: Date;
}

@Table({
	tableName: "django_migrations",
	timestamps: false 
})
export class djangoMigrations extends Model<djangoMigrationsAttributes, djangoMigrationsAttributes> implements djangoMigrationsAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('django_migrations_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	app?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(255) 
    })
    	name?: string;

    @Column({
    	allowNull: true,
    	type: DataType.DATE 
    })
    	applied?: Date;

}