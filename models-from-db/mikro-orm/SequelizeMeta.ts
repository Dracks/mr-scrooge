import { Entity, Property } from '@mikro-orm/core';

@Entity({ tableName: 'SequelizeMeta' })
export class SequelizeMeta {

  @Property({ nullable: true })
  name?: string;

}
