import { Column,Table } from '@knestjs/core';

import { UserGroupModel } from './group.model';

@Table({
    name: 'session_user',
})
export class UserModel {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        unique: true,
        nullable: false,
        type: 'int'
    })
    id!: number;

    @Column({
        name: 'default_group_id',
        nullable: false,
        type: 'int',
    })
    // @ForeignKey(() => UserGroupModel)
    defaultGroupId?: UserGroupModel['id'];

    @Column({
        nullable: false,
        type: 'varchar',
        length: 128,
    })
    password!: string;

    @Column({
        name: 'last_login',
        nullable: true,
        type: 'datetime',
    })
    lastLogin?: Date;

    @Column({
        name: 'is_superuser',
        nullable: false,
        type: 'boolean',
    })
    isSuperuser!: boolean;

    @Column({
        nullable: false,
        type: 'varchar',
        length: 150,
    })
    username!: string;

    @Column({
        name: 'first_name',
        nullable: false,
        type: 'varchar',
        length: 150,
    })
    firstName!: string;

    @Column({
        name: 'last_name',
        nullable: false,
        type: 'varchar',
        length: 150,
    })
    lastName!: string;

    @Column({
        nullable: false,
        type: 'varchar',
        length: 254,
    })
    email!: string;

    @Column({
        name: 'is_staff',
        nullable: false,
        type: 'boolean',
    })
    isStaff!: boolean;

    @Column({
        name: 'is_active',
        nullable: false,
        type: 'boolean',
    })
    isActive!: boolean;

    @Column({
        name: 'date_joined',
        nullable: false,
        type: 'datetime',
    })
    dateJoined!: Date;
}
