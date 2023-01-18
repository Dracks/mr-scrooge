import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { GroupEntity } from './entities/group.entity';
import { SessionEntity } from './entities/session.entity';
import { UserEntity } from './entities/user.entity';
import { UserGroupEntity } from './entities/user-group.entity';
import { SessionResolver } from './resolvers/session.resolver';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';
import { UserProfileService } from './services/user-profile.service';

@Module({
    imports: [MikroOrmModule.forFeature([UserEntity, GroupEntity, UserGroupEntity, SessionEntity])],
    providers: [SessionResolver, UserProfileService, PasswordService, SessionService],
    exports: [UserProfileService, SessionService],
})
export class SessionModule {}
