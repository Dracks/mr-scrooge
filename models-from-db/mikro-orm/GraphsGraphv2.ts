import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { GraphsGraph } from './GraphsGraph';
import { ManagementTag } from './ManagementTag';

@Entity()
export class GraphsGraphv2 {

  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  kind!: string;

  @Property()
  dateRange!: string;

  @ManyToOne({ entity: () => GraphsGraph, nullable: true, index: 'graphs_graphv2_old_graph_id_b0a12b58' })
  oldGraph?: GraphsGraph;

  @ManyToOne({ entity: () => ManagementTag, nullable: true, index: 'graphs_graphv2_tag_filter_id_dca1cd29' })
  tagFilter?: ManagementTag;

}
