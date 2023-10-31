import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Confirmation {
    @Field(() => Boolean)
    confirm!: true;
}
