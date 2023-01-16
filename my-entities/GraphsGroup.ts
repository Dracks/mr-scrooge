import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { GraphsGraphv2 } from './GraphsGraphv2';

@Entity()
export class GraphsGroup {

  @PrimaryKey()
  id!: number;

  @Property()
  group!: string;

  @Property({ columnType: 'bool', nullable: true })
  hideOthers?: unknown;

  @ManyToOne({ entity: () => GraphsGraphv2 })
  graph!: GraphsGraphv2;

}
