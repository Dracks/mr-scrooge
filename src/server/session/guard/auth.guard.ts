import { SecureSessionPluginOptions } from '@fastify/secure-session';
import * as SecureSession from '@fastify/secure-session';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { UserProfileService } from '../user-profile.service';
import { Role } from './roles.decorator';


@Injectable()
export class AuthGuard implements CanActivate {
  readonly logger = new Logger(AuthGuard.name);

  constructor(private userService: UserProfileService, private reflector: Reflector){

  }

  async canActivate(
    context: ExecutionContext,
  ):  Promise<boolean> {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler()) ?? [];
    this.logger.log({roles}, 'some roles')

    if (roles.length ==1 && roles[0]=== Role.GUEST){
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const {session} :{session: SecureSession.Session}= context.getArgByIndex(2);
    const user = await this.userService.getUserProfile(session.get('userId'))
    if (user && user.isActive){

      if (roles.length>0 && roles.includes(Role.ADMIN)){
        return user.isSuperuser ?? false;
      }
      return true;
    }
    return false;
  }
}