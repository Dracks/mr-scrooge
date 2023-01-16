import { Entity, ManyToOne, PrimaryKey, Unique } from '@mikro-orm/core';
import { AuthPermission } from './AuthPermission';
import { AuthUser } from './AuthUser';

@Entity()
@Unique({ name: 'auth_user_user_permissions_user_id_permission_id_14a6b632_uniq', properties: ['user', 'permission'] })
export class AuthUserUserPermissions {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => AuthUser, index: 'auth_user_user_permissions_user_id_a95ead1b' })
  user!: AuthUser;

  @ManyToOne({ entity: () => AuthPermission, index: 'auth_user_user_permissions_permission_id_1fbb5f2c' })
  permission!: AuthPermission;

}
