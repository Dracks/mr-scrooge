import { Entity, ManyToOne, PrimaryKey, Unique } from '@mikro-orm/core';
import { AuthGroup } from './AuthGroup';
import { AuthUser } from './AuthUser';

@Entity()
@Unique({ name: 'auth_user_groups_user_id_group_id_94350c0c_uniq', properties: ['user', 'group'] })
export class AuthUserGroups {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => AuthUser, index: 'auth_user_groups_user_id_6a12ed8b' })
  user!: AuthUser;

  @ManyToOne({ entity: () => AuthGroup, index: 'auth_user_groups_group_id_97559544' })
  group!: AuthGroup;

}
