import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { PasswordService } from './password.service';
import { SessionResolver } from './resolvers/session.resolver';
import { UserProfileService } from './user-profile.service';
import { UserEntity } from './entities/user.entity'

@Module({
	imports: [MikroOrmModule.forFeature([UserEntity])],
	providers: [SessionResolver, UserProfileService, PasswordService],
	exports: [UserProfileService],
})
export class SessionModule { }