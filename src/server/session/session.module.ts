import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize'

import { UserModel } from './models/user.model';
import { PasswordService } from './password.service';
import { SessionResolver } from './resolvers/session.resolver';
import { UserProfileService } from './user-profile.service';

@Module({
	imports: [SequelizeModule.forFeature([UserModel])],
	providers: [SessionResolver, UserProfileService, PasswordService],
	exports: [UserProfileService],
})
export class SessionModule { }