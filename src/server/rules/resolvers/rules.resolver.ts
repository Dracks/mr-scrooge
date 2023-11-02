import { Query, Resolver } from '@nestjs/graphql';

import { GqlGroupsId } from '../../session';
import { Rule } from '../gql-objects/rule.object';
import { RuleService } from '../rule.service';


@Resolver(() => Rule)
export class RuleResolver {
    constructor(readonly rulesService: RuleService){}

    @Query(()=>[Rule])
    async rules(@GqlGroupsId() groupsId: number[]){
        const rules = await this.rulesService.getRules(groupsId);
        return rules;
    }
}
