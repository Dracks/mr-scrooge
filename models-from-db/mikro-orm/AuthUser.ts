import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class AuthUser {

  @PrimaryKey()
  id!: number;

  @Property()
  password!: string;

  @Property({ nullable: true })
  lastLogin?: Date;

  @Property({ columnType: 'bool' })
  isSuperuser!: unknown;

  @Property()
  username!: string;

  @Property()
  lastName!: string;

  @Property()
  email!: string;

  @Property({ columnType: 'bool' })
  isStaff!: unknown;

  @Property({ columnType: 'bool' })
  isActive!: unknown;

  @Property()
  dateJoined!: Date;

  @Property()
  firstName!: string;

}
