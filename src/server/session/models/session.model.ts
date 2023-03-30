/* eslint-disable no-use-before-define */
import { Column, Table } from '@knestjs/core';

import { UserModel } from './user.model';

@Table({ name: 'session_session' })
export class SessionModel  {
    @Column({
        type: 'varchar',
        primaryKey: true,
        nullable: false,
        length: 255
    })
    sessionId!: string;

    // @ForeignKey(() => UserModel)
    @Column({
        type: 'int',
        nullable: false,
    })
    userId!: number;


    // @BelongsTo(() => UserModel, { onDelete: 'CASCADE' })
    user?: UserModel;


    @Column({
        nullable: false,
        type: 'datetime',
    })
    createdAt!: Date;

    // @Index
    @Column({
        nullable: false,
        type: 'datetime',
    })
    lastActivity!: Date;
}
