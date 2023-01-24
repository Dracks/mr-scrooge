import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize'

import { UserModel } from './models/user.model';
import {SessionModel} from './models/session.model';
import { PasswordService } from './services/password.service';
import { SessionResolver } from './resolvers/session.resolver';
import { UserProfileService } from './services/user-profile.service';
import { SessionService } from './services/session.service';

@Module({
    imports: [SequelizeModule.forFeature([UserModel, SessionModel])],
    providers: [SessionResolver, UserProfileService, PasswordService, SessionService],
    exports: [UserProfileService, SessionService],
})
export class SessionModule { }