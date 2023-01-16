import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class AuthGroup {

  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

}
