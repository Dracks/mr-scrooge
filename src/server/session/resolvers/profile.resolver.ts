import { Logger } from '@nestjs/common';
import { Args, Context, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';

import { WebSession } from '../../common/web-session.type';
import { UserProfileService } from '../services/user-profile.service';

@InputType()
export class ChangePasswordArgs {
    @Field(() => String)
    oldPassword!: string;

    @Field(() => String)
    newPassword!: string;
}

@Resolver()
export class ProfileResolver {
    readonly logger = new Logger(ProfileResolver.name);

    constructor(readonly userProfileService: UserProfileService) {}

    @Mutation(() => Boolean)
    async changePassword(
        @Context('session') session: WebSession,
        @Args('change') { oldPassword, newPassword }: ChangePasswordArgs,
    ) {
        try {
            await this.userProfileService.changePassword(session.get('userId') as number, oldPassword, newPassword);
            return true;
        } catch (error ){
            this.logger.warn(error);
            return false;
        }
    }
}
