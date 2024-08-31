import { Query, Resolver } from '@nestjs/graphql';

import { GqlGroupsId } from '../../session/decorators/gql-groups-id';
import { Label } from '../gql-objects/label.object';
import { LabelService } from '../services/label.service';

@Resolver(() => Label)
export class LabelResolver {
    constructor(private readonly labelService: LabelService) {}

    @Query(() => [Label])
    labels(@GqlGroupsId() groupsId: number[]) {
        return this.labelService.getAll(groupsId);
    }
}
