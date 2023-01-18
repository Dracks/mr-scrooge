import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'auth_user' })
export class UserEntity {
    @PrimaryKey()
    id!: number;

    @Property()
    password!: string;

    @Property({ nullable: true })
    lastLogin?: Date;

    @Property({ columnType: 'bool' })
    isSuperuser!: boolean;

    @Property()
    username!: string;

    @Property()
    lastName!: string;

    @Property()
    email!: string;

    @Property({ columnType: 'bool' })
    isStaff!: boolean;

    @Property({ columnType: 'bool' })
    isActive!: boolean;

    @Property()
    dateJoined!: Date;

    @Property()
    firstName!: string;
}
