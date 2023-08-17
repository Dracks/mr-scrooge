import { CallHandler, ExecutionContext, Injectable, Logger,NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { match } from 'ts-pattern';

import { UserProfileService } from '../services/user-profile.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuthInterceptor.name)

    constructor(readonly userService: UserProfileService) { }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async intercept(context: ExecutionContext &{getRequest: ()=>void}, next: CallHandler): Promise<Observable<any>> {

        const request = match(context.getType<'http' | 'graphql'>())
            .with('http', ()=>context.switchToHttp().getRequest())
            .with('graphql', ()=>context.getArgByIndex(2))
            .run()

        const { session } = request;
        const userId = session && session.get('userId');

        if (userId) {
            request.groupsId = await this.userService.getGroupsId(userId);
        }
        return next.handle()
    }
}
