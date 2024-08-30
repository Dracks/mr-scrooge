/* eslint-disable no-use-before-define */
import { Attributes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, ForeignKey, Index, Model, Table } from 'sequelize-typescript';

import { BankTransaction, IBankTransaction } from '../../bank-transaction/models/bank-transaction.model';
import { StatusReport } from './status-report';

@Table({
    tableName: 'importer_status_report_row',
    timestamps: false,
})
export class StatusReportRow
    extends Model<InferAttributes<StatusReportRow>, InferCreationAttributes<StatusReportRow>>
    implements Omit<IBankTransaction, 'kind' | 'pageKey' | 'groupOwnerId'>
{
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id!: CreationOptional<number>;

    @ForeignKey(() => StatusReport)
    @Column({ allowNull: false, field: 'report_id', type: DataType.INTEGER })
    reportId!: StatusReport['id'];

    @ForeignKey(() => BankTransaction)
    @Column({ allowNull: true, field: 'transaction_id', type: DataType.INTEGER })
    transactionId?: BankTransaction['id'];

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    message?: string;

    @Column({
        field: 'movement_name',
        type: DataType.STRING(255),
        allowNull: false,
    })
    movementName!: string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
    })
    @Index
    date!: string;

    @Column({
        field: 'date_value',
        allowNull: true,
        type: DataType.DATEONLY,
    })
    dateValue?: string;

    @Column({
        allowNull: true,
        type: DataType.STRING,
    })
    details?: string;

    @Column({
        type: DataType.DOUBLE,
        allowNull: false,
    })
    value!: number;

    @Column({
        allowNull: true,
        type: DataType.STRING,
    })
    description?: string;
}

export type IStatusReportRow = Attributes<StatusReportRow>;
