import { Field, Int, ObjectType } from '@nestjs/graphql';

import { GQLBaseError, GQLError, GQLErrorFactory } from '../../common/errors/gql-error.decorator';

@ObjectType()
@GQLError('InvalidGraph')
export class InvalidGraph extends GQLBaseError {
    @Field(() => [Int])
    availableGraphsId!: number[];

    static build = GQLErrorFactory(InvalidGraph);
}
