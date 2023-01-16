import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { GraphsGraphv2 } from './GraphsGraphv2';

@Entity()
export class GraphsHorizontalgroup {

  @PrimaryKey()
  id!: number;

  @Property()
  group!: string;

  @Property({ columnType: 'bool', nullable: true })
  hideOthers?: unknown;

  @Property({ columnType: 'bool' })
  accumulate!: unknown;

  @ManyToOne({ entity: () => GraphsGraphv2 })
  graph!: GraphsGraphv2;

}
