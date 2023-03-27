import {Field, Int,ObjectType} from '@nestjs/graphql'

import { GQLBaseError, GQLError, GQLErrorFactory } from '../../common/errors/gql-error.decorator'


@ObjectType()
@GQLError('WrongOwnerId')
export class WrongOwnerId extends GQLBaseError{
    @Field(()=>[Int])
    validOwners!: number[]

    static build = GQLErrorFactory(WrongOwnerId)
}
