import { SecureSessionPluginOptions } from '@fastify/secure-session';
import * as SecureSession from '@fastify/secure-session';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { add, isFuture } from 'date-fns';
import { Observable } from 'rxjs';

import { Config } from '../../core/config/config';
import { SessionEntity } from '../entities/session.entity';
import { SessionService } from '../services/session.service';
import { Role } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    readonly logger = new Logger(AuthGuard.name);

    readonly getDate: (session: SessionEntity) => Date;

    constructor(private sessionService: SessionService, private reflector: Reflector, readonly config: Config) {
        if (config.sessionUseLastActivity) {
            this.getDate = session => session.lastActivity;
        } else {
            this.getDate = session => session.createdAt;
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<Role[]>('roles', context.getHandler()) ?? [];
        this.logger.log({ roles }, 'some roles');

        if (roles.length == 1 && roles[0] === Role.GUEST) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const { session }: { session: SecureSession.Session } = context.getArgByIndex(2);

        const sessionData = await this.sessionService.getSession(session.get('sessionId'));
        console.log(sessionData);
        if (sessionData) {
            const { user } = sessionData;
            const dateToCheck = this.getDate(sessionData);
            if (isFuture(add(dateToCheck, { days: this.config.sessionDaysActive })) && user.isActive) {
                if (roles.length > 0 && roles.includes(Role.ADMIN)) {
                    return user.isSuperuser ?? false;
                }
                return true;
            }
        }
        return false;
    }
}
