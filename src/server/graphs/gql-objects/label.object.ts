import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Label {
    @Field()
    id!: number;

    @Field()
    groupOwnerId!: number;

    @Field()
    name!: string;
}
