import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserGroupModel } from './models/group.model';

import { SessionModel } from './models/session.model';
import { UserModel } from './models/user.model';
import { SessionResolver } from './resolvers/session.resolver';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';
import { UserProfileService } from './services/user-profile.service';

@Module({
    imports: [SequelizeModule.forFeature([UserModel, SessionModel, UserGroupModel])],
    providers: [SessionResolver, UserProfileService, PasswordService, SessionService],
    exports: [UserProfileService, SessionService],
})
export class SessionModule {}
