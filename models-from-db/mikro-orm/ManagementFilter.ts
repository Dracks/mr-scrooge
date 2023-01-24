import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ManagementTag } from './ManagementTag';

@Entity()
export class ManagementFilter {

  @PrimaryKey()
  id!: number;

  @Property()
  typeConditional!: string;

  @Property()
  conditional!: string;

  @ManyToOne({ entity: () => ManagementTag, index: 'management_filter_tag_id_54acf8eb' })
  tag!: ManagementTag;

}
