import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class DjangoSession {

  @PrimaryKey()
  sessionKey!: string;

  @Property()
  sessionData!: string;

  @Index({ name: 'django_session_expire_date_a5c62663' })
  @Property()
  expireDate!: Date;

}
