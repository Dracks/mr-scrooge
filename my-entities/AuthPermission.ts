import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { DjangoContentType } from './DjangoContentType';

@Entity()
@Unique({ name: 'auth_permission_content_type_id_codename_01ab375a_uniq', properties: ['contentType', 'codename'] })
export class AuthPermission {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => DjangoContentType, index: 'auth_permission_content_type_id_2f476e4b' })
  contentType!: DjangoContentType;

  @Property()
  codename!: string;

  @Property()
  name!: string;

}
