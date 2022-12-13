import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface djangoContentTypeAttributes {
    id?: number;
    appLabel?: string;
    model?: string;
}

@Table({
	tableName: "django_content_type",
	timestamps: false 
})
export class djangoContentType extends Model<djangoContentTypeAttributes, djangoContentTypeAttributes> implements djangoContentTypeAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('django_content_type_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	field: "app_label",
    	allowNull: true,
    	type: DataType.STRING(100) 
    })
    	appLabel?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(100) 
    })
    	model?: string;

}