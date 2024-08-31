import { Attributes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { AllowNull, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { ImportStatus } from '../importers/types';
import { UserGroupModel } from '../../session/models/group.model';

@Table({
    tableName: 'importer_status_report',
})
export class StatusReport extends Model<InferAttributes<StatusReport>, InferCreationAttributes<StatusReport>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id!: CreationOptional<number>;

    @ForeignKey(() => UserGroupModel)
    @Column({ allowNull: false, field: 'group_owner_id', type: DataType.INTEGER })
    groupOwnerId!: number;

    @Column({ allowNull: false, type: DataType.ENUM, values: ['OK', 'WARN', 'ERROR'] })
    status!: ImportStatus;

    @Column({
        allowNull: true,
        type: DataType.STRING,
    })
    description!: string;

    @Column({
        allowNull: true,
        type: DataType.TEXT,
    })
    stack?: string;

    @Column({
        allowNull: true,
        type: DataType.TEXT,
    })
    context?: string;

    @Column({
        allowNull: false,
        type: DataType.STRING(255),
    })
    fileName!: string;

    @Column({
        allowNull: false,
        type: DataType.STRING(255),
    })
    kind!: string;
}

export type IStatusReport = Attributes<StatusReport>;
