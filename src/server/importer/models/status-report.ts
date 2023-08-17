import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import {Column, DataType, Model, Table} from 'sequelize-typescript';

import { ImportStatus } from '../importers/types'

@Table({
  tableName: 'importer_status_report'
})
export class StatusReport extends Model<InferAttributes<StatusReport>, InferCreationAttributes<StatusReport>> {
  
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id!: CreationOptional<number>;
  
    status!: ImportStatus
    fileName!: string
    kind!: string
}