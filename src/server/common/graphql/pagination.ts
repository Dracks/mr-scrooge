import { Field, ObjectType } from '@nestjs/graphql';

import { ListWithCursor } from '../cursor-handler';

@ObjectType()
export class GetPageResponse<T> {
    results!: T[];

    @Field(() => String, { nullable: true })
    next?: string;
}
