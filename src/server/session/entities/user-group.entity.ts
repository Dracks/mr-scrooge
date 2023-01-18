import { Entity, ManyToOne, PrimaryKey, Unique } from '@mikro-orm/core';

import { GroupEntity } from './group.entity';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'auth_user_groups' })
@Unique({ name: 'auth_user_groups_user_id_group_id_94350c0c_uniq', properties: ['user', 'group'] })
export class UserGroupEntity {
    @PrimaryKey()
    id!: number;

    @ManyToOne({ entity: () => UserEntity, index: 'auth_user_groups_user_id_6a12ed8b' })
    user!: UserEntity;

    @ManyToOne({ entity: () => GroupEntity, index: 'auth_user_groups_group_id_97559544' })
    group!: GroupEntity;
}
