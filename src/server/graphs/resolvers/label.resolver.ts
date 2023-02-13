import { Query,Resolver } from '@nestjs/graphql';

import { Label } from '../gql-objects/label.object';

@Resolver(() => Label)
export class LabelResolver {
    @Query(() => [Label])
    label() {}
}
