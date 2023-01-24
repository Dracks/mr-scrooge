import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { CoreRawdatasource } from './CoreRawdatasource';
import { ManagementTag } from './ManagementTag';

@Entity()
@Unique({ name: 'management_valuestotag_raw_data_source_id_tag_id_79c573b0_uniq', properties: ['rawDataSource', 'tag'] })
export class ManagementValuestotag {

  @PrimaryKey()
  id!: number;

  @Property()
  enable!: number;

  @Property()
  automatic!: number;

  @ManyToOne({ entity: () => ManagementTag, index: 'tag_idx' })
  tag!: ManagementTag;

  @ManyToOne({ entity: () => CoreRawdatasource, index: 'rds_idx' })
  rawDataSource!: CoreRawdatasource;

}
