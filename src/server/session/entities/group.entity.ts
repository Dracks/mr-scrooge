import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'auth_group' })
export class GroupEntity {
    @PrimaryKey()
    id!: number;

    @Property()
    name!: string;
}
