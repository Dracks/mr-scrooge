import * as Factory from 'factory.ts';

import { Rule, RuleCondition } from '../../api/models';
import { RuleEnriched } from '../../contents/rules/rule-enriched';
import { generateUUID } from './uuid.factory';

const baseRuleFactory = Factory.Sync.makeFactory<Omit<Rule, 'children' | 'labelIds'>>({
    id: Factory.each(id => generateUUID(id, 'rule')),
    conditions: [],
    groupOwnerId: 'some-group-id',
    name: Factory.each(id => `rule ${id.toString()}`),
    relations: 'or',
});

export const ruleFactory: Factory.Factory<Rule> = baseRuleFactory.combine(
    Factory.Sync.makeFactory<Pick<Rule, 'labelIds'>>({
        labelIds: [],
    }),
);

export const ruleEnhancedFactory = baseRuleFactory.combine(
    Factory.Sync.makeFactory<Pick<RuleEnriched, 'labels' | 'children'>>({
        children: [],
        labels: [],
    }),
);

export const conditionFactory = Factory.Sync.makeFactory<RuleCondition>({
    id: Factory.each(id => generateUUID(id, 'cond')),
    operation: 'contains',
    value: 'some text',
});
