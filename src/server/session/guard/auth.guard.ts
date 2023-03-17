import { SecureSessionPluginOptions } from '@fastify/secure-session';
import * as SecureSession from '@fastify/secure-session';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { add, isFuture } from 'date-fns';
import { Observable } from 'rxjs';

import { Config } from '../../core/config/config';
import { ISessionModel, SessionModel } from '../models/session.model';
import { SessionService } from '../services/session.service';
import { UserProfileService } from '../services/user-profile.service';
import { Role } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    readonly logger = new Logger(AuthGuard.name);

    readonly getDate: (session: ISessionModel) => Date;

    constructor(
        private sessionService: SessionService,
        private userProfileService: UserProfileService,
        private reflector: Reflector,
        readonly config: Config,
    ) {
        if (config.sessionUseLastActivity) {
            this.getDate = session => session.lastActivity;
        } else {
            this.getDate = session => session.createdAt;
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<Role[]>('roles', context.getHandler()) ?? [];
        this.logger.log({ roles }, 'some roles');

        const request = context.switchToHttp().getRequest();

        let { session } = request;
        if (!session) session = context.getArgByIndex(2).session;
        const { sessionId = '' } = session.data() ?? {};
        const sessionData = await this.sessionService.getSession(sessionId);


        if (roles.length == 1 && roles[0] === Role.GUEST) {
            if (sessionId.length>0 && !sessionData){
                session.delete()
            }
            return true;
        }

        console.log('session', sessionData, sessionId);
        this.logger.warn({sessionData, sessionId}, 'session')
        if (sessionData) {
            // const user = sessionData.$get('user');
            const user = await this.userProfileService.getUserProfile(sessionData.userId);
            if (user && user.isActive && session.get('userId') === user.id) {
                const dateToCheck = this.getDate(sessionData);
                if (isFuture(add(dateToCheck, { days: this.config.sessionDaysActive }))) {
                    this.logger.warn({roles, superUser: user.isSuperuser}, 'roles check?')
                    if (roles.length > 0 && roles.includes(Role.ADMIN)) {
                        return user.isSuperuser ?? false;
                    }
                    return true;
                }
            }
            await this.sessionService.dropSession(sessionId);
        }
        session.delete()
        return false;
    }
}
