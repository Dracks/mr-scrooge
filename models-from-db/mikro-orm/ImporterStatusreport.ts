import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ImporterStatusreport {

  @PrimaryKey()
  id!: number;

  @Property()
  kind!: string;

  @Property()
  date!: Date;

  @Property()
  fileName!: string;

  @Property()
  status!: string;

  @Property()
  description!: string;

}
