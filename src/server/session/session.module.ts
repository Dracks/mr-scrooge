import { Module } from '@nestjs/common';
import { KnestObjectionModule } from '@knestjs/objection'

import { UserGroupModel } from './models/group.model';
import { SessionModel } from './models/session.model';
import { UserModel } from './models/user.model';
import { UserGroupRelModel } from './models/user-group-rel.model';
import { SessionResolver } from './resolvers/session.resolver';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';
import { UserProfileService } from './services/user-profile.service';

@Module({
    imports: [KnestObjectionModule.forFeature([UserModel, SessionModel, UserGroupModel, UserGroupRelModel])],
    providers: [SessionResolver, UserProfileService, PasswordService, SessionService],
    exports: [UserProfileService, SessionService],
})
export class SessionModule {}
