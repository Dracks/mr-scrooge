import { Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { GraphsHorizontalgroup } from './GraphsHorizontalgroup';
import { ManagementTag } from './ManagementTag';

@Entity()
export class GraphsHorizontalgrouptags {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => GraphsHorizontalgroup, index: 'graphs_horizontalgrouptags_group_id_fcc641d2' })
  group!: GraphsHorizontalgroup;

  @ManyToOne({ entity: () => ManagementTag, index: 'graphs_horizontalgrouptags_tag_id_57065506' })
  tag!: ManagementTag;

}
