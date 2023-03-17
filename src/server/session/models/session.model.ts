/* eslint-disable no-use-before-define */
import {  InferAttributes, InferCreationAttributes } from 'sequelize';
import { BelongsTo, Column, DataType, ForeignKey, Index, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { UserModel } from './user.model';

export type ISessionModel = InferAttributes<SessionModel>;

@Table({ tableName: 'session_session' })
export class SessionModel extends Model<ISessionModel, InferCreationAttributes<SessionModel>> {
    @PrimaryKey
    @Column
    sessionId!: string;

    @ForeignKey(() => UserModel)
    @Column
    userId!: number;

    
    @BelongsTo(() => UserModel, { onDelete: 'CASCADE' })
    user?: UserModel;
     

    @Index
    @Column({
        allowNull: false,
        type: DataType.DATE,
    })
    createdAt!: Date;

    @Index
    @Column({
        allowNull: false,
        type: DataType.DATE,
    })
    lastActivity!: Date;
}
