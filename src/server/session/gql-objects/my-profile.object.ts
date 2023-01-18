import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MyProfile {
    @Field(() => String)
    email?: string;

    @Field(() => String)
    firstName?: string;

    @Field(() => String)
    lastName?: string;

    @Field(() => String)
    username?: string;
}
