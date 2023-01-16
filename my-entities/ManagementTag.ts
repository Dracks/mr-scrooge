import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ManagementTag {

  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ columnType: 'bool' })
  negateConditional!: unknown;

  @ManyToOne({ entity: () => ManagementTag, nullable: true, index: 'management_tag_parent_id_25f7b7af' })
  parent?: ManagementTag;

}
