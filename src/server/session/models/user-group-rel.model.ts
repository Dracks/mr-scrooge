/* eslint-disable no-use-before-define */
import { Column, Table } from '@knestjs/core';

import { UserGroupModel } from './group.model';
import { UserModel } from './user.model';


@Table({
    name: 'user_group_rel',
    indexes: [
        //{fields: ['user_id', 'user_group_id',], unique: true}
        {properties: ['userId', 'userGroupId'], unique: true}
    ]
})
export class UserGroupRelModel {
    //@ForeignKey(() => UserGroupModel)
    @Column({
        nullable: false,
        type: 'int',
        name: 'user_group_id'
    })
    userGroupId!: UserGroupModel['id'];

    //@ForeignKey(()=> UserModel)
    @Column({
        nullable: false,
        type: 'int',
        name: 'user_id'
    })
    userId!: UserModel['id'];
}
