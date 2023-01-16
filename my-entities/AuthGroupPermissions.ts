import { Entity, ManyToOne, PrimaryKey, Unique } from '@mikro-orm/core';
import { AuthGroup } from './AuthGroup';
import { AuthPermission } from './AuthPermission';

@Entity()
@Unique({ name: 'auth_group_permissions_group_id_permission_id_0cd325b0_uniq', properties: ['group', 'permission'] })
export class AuthGroupPermissions {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => AuthGroup, index: 'auth_group_permissions_group_id_b120cbf9' })
  group!: AuthGroup;

  @ManyToOne({ entity: () => AuthPermission, index: 'auth_group_permissions_permission_id_84c5c92e' })
  permission!: AuthPermission;

}
