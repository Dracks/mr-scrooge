import { Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { GraphsGroup } from './GraphsGroup';
import { ManagementTag } from './ManagementTag';

@Entity()
export class GraphsGrouptags {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => GraphsGroup, index: 'graphs_grouptags_group_id_7780e3a5' })
  group!: GraphsGroup;

  @ManyToOne({ entity: () => ManagementTag, index: 'graphs_grouptags_tag_id_be070211' })
  tag!: ManagementTag;

}
