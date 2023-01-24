import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class DjangoMigrations {

  @PrimaryKey()
  id!: number;

  @Property()
  app!: string;

  @Property()
  name!: string;

  @Property()
  applied!: Date;

}
