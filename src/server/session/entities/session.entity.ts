import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { UserEntity } from './user.entity';

@Entity({ tableName: 'nest_session' })
export class SessionEntity {
    @PrimaryKey()
    sessionId!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'cascade' })
    user!: UserEntity;

    @Index()
    @Property()
    createdAt!: Date;

    @Index()
    @Property()
    lastActivity!: Date;
}
