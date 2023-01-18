import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';

import { SessionEntity } from '../entities/session.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class SessionService {
    private readonly logger = new Logger(this.constructor.name);

    constructor(@InjectRepository(SessionEntity) private readonly sessionRepository: EntityRepository<SessionEntity>) {}

    public async newSession(user: UserEntity): Promise<SessionEntity> {
        const sessionId = nanoid();

        const session = await this.sessionRepository.create({
            sessionId,
            user,
            createdAt: new Date(),
            lastActivity: new Date(),
        });
        return session;
    }

    public async getSession(sessionId: string): Promise<SessionEntity | undefined> {
        const session = await this.sessionRepository.findOne({ sessionId });
        if (session) {
            return {
                sessionId: session.sessionId,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity,
                user: session.user,
            };
        }
    }

    public async dropSession(sessionId: string): Promise<void> {
        await this.sessionRepository.nativeDelete({ sessionId });
    }
}
