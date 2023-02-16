import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserProfileService } from '../services/user-profile.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuthInterceptor.name)

    constructor(readonly userService: UserProfileService) { }
    async intercept(context: ExecutionContext &{getRequest: ()=>void}, next: CallHandler): Promise<Observable<any>> {

        let request = context.switchToHttp().getRequest();

        if (!request.session) request = context.getArgByIndex(2) 
        let { session } = request;
        const userId = session.get('userId');

        if (userId) {
            request.groupsId = await this.userService.getGroupsId(userId);
        } 
        return next.handle()
    }
}
