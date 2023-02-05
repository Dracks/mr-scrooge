import {Args, Context, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';

import { WebSession } from '../../common/web-session.type';
import { UserProfileService } from '../services/user-profile.service';

@InputType()
export class ChangePasswordArgs {
    @Field(()=>String)
    oldPassword!: string;

    @Field(()=>String)
    newPassword!: string;
}

@Resolver()
export class ProfileResolver{
	constructor(readonly userProfileService: UserProfileService){}

    @Mutation(()=>Boolean)
    changePassword(@Context('session') session: WebSession, @Args('change') {oldPassword, newPassword}: ChangePasswordArgs){
        this.userProfileService.changePassword(session.get('userId'), oldPassword, newPassword)
    }
}
