import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
@Index({ name: 'core_rawdat_kind_b0d86a_idx', properties: ['kind', 'movementName', 'date', 'value'] })
export class CoreRawdatasource {

  @PrimaryKey()
  id!: number;

  @Property()
  movementName!: string;

  @Property({ columnType: 'date' })
  date!: string;

  @Property({ columnType: 'date', nullable: true })
  dateValue?: string;

  @Property({ nullable: true })
  details?: string;

  @Property({ columnType: 'REAL' })
  value!: unknown;

  @Property()
  kind!: string;

  @Property({ nullable: true })
  description?: string;

  @Index({ name: 'core_rawdat_page_ke_489283_idx' })
  @Property()
  pageKey!: string;

}
