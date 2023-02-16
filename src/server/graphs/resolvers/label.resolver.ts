import { Query,Resolver } from '@nestjs/graphql';

import { Label } from '../gql-objects/label.object';
import { LabelService } from '../services/label.service';

@Resolver(() => Label)
export class LabelResolver {
    constructor(private readonly labelService: LabelService) {}
    @Query(() => [Label])
    label() {
        return this.labelService.getAll(1);
    }
}
