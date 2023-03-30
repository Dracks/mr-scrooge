import { Column, Table } from '@knestjs/core';

export interface AuthUserGroupsAttributes {
    groupId: number;
    id?: number;
    userId: number;
}

@Table({
    name: 'session_user_groups',
})
export class AuthUserGroups
{
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: 'int',
        nullable: false,
    })
    id!: number;

    @Column({
        name: 'user_id',
        nullable: false,
        type: 'int',
    })
    userId!: number;

    @Column({
        name: 'group_id',
        nullable: false,
        type: 'int',
    })
    groupId!: number;
}
