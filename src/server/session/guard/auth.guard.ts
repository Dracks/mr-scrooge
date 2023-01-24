import { SecureSessionPluginOptions } from '@fastify/secure-session';
import * as SecureSession from '@fastify/secure-session';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { add, isFuture } from 'date-fns';
import { Observable } from 'rxjs';

import { Config } from '../../core/config/config';
import { ISessionModel, SessionModel } from '../models/session.model';
import { SessionService } from '../services/session.service';
import { Role } from './roles.decorator';
import { UserProfileService } from '../services/user-profile.service';

@Injectable()
export class AuthGuard implements CanActivate {
    readonly logger = new Logger(AuthGuard.name);

    readonly getDate: (session: ISessionModel) => Date;

    constructor(private sessionService: SessionService, private userProfileService: UserProfileService, private reflector: Reflector, readonly config: Config) {
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

        let session: SecureSession.Session = request.session;
        if (!session)
            session = context.getArgByIndex(2).session;
        // const session = request.session;
        const {sessionId = "-"} = session.data() ?? {}

        const sessionData = await this.sessionService.getSession(sessionId);
        // console.log(sessionData, sessionId);
        if (sessionData) {
            // const user = sessionData.$get('user');
            const user = await this.userProfileService.getUserProfile(sessionData.userId);
            if (user) {
                const dateToCheck = this.getDate(sessionData);
                if (isFuture(add(dateToCheck, { days: this.config.sessionDaysActive })) && user.isActive) {
                    if (roles.length > 0 && roles.includes(Role.ADMIN)) {
                        return user.isSuperuser ?? false;
                    }
                    return true;
                }
            } else {
                await this.sessionService.dropSession(sessionId)
            }
        }
        return false;
    }
}
