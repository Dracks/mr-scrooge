import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class GraphsGraph {

  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  kind!: string;

  @Property()
  options!: string;

}
