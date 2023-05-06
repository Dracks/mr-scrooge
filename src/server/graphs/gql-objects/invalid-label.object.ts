import { Field, Int, ObjectType } from "@nestjs/graphql";

import { GQLBaseError, GQLError, GQLErrorFactory } from "../../common/errors/gql-error.decorator";

@ObjectType()
@GQLError('InvalidLabel')
export class InvalidLabel extends GQLBaseError{
    @Field(()=>[Int])
    invalidLabels!: number[];

    static build = GQLErrorFactory(InvalidLabel)
}