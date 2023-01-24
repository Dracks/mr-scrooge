import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { AuthUser } from './AuthUser';
import { DjangoContentType } from './DjangoContentType';

@Entity()
export class DjangoAdminLog {

  @PrimaryKey()
  id!: number;

  @Property()
  actionTime!: Date;

  @Property({ nullable: true })
  objectId?: string;

  @Property()
  objectRepr!: string;

  @Property()
  changeMessage!: string;

  @ManyToOne({ entity: () => DjangoContentType, nullable: true, index: 'django_admin_log_content_type_id_c4bce8eb' })
  contentType?: DjangoContentType;

  @ManyToOne({ entity: () => AuthUser, index: 'django_admin_log_user_id_c564eba6' })
  user!: AuthUser;

  @Property()
  actionFlag!: number;

}
