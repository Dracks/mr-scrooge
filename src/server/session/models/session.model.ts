import { Column, DataType, ForeignKey, BelongsTo, Index, Model, Sequelize, Table, PrimaryKey } from 'sequelize-typescript';
import { CreationOptional, InferAttributes, InferCreationAttributes, Optional } from 'sequelize';
import { UserModel } from './user.model';

export type ISessionModel = InferAttributes<SessionModel>;

@Table({ tableName: 'nest_session' })
export class SessionModel extends Model<ISessionModel, InferCreationAttributes<SessionModel>> {
    @PrimaryKey
    @Column
    sessionId!: string;

    @ForeignKey(()=> UserModel)
    @Column
    userId!: number;

    //@BelongsTo(() => UserModel, { onDelete: 'CASCADE' })
    //user!: UserModel;

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