/* eslint-disable no-use-before-define */
import { Column, Table } from '@knestjs/core';

import { UserModel } from './user.model';

@Table({
    name: 'user_group',
})
export class UserGroupModel {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: 'int',
        nullable: false,
    })
    id!: number;

    @Column({
        nullable: false,
        type: 'varchar',
        length: 150,
    })
    name!: string;

    @Column({
        nullable: false,
        type: 'int',
    })
    // @ForeignKey(() => UserModel)
    ownerId!: number;
}
