import { ApiUUID, Label, Rule } from '../../api/models';

export type RuleEnriched = Omit<Rule, 'children' | 'labelIds'> & {
    children: RuleEnriched[];
    labels: Label[];
};

export const enrichRuleList = (
    rules: Rule[],
    labelsMap: Map<ApiUUID, Label>,
): { rules: RuleEnriched[]; rulesMap: Map<ApiUUID, RuleEnriched> } => {
    const rulesEnriched: RuleEnriched[] = rules.map(
        ({ labelIds: labelIds, ...rule }: Rule) =>
            ({
                ...rule,
                children: [],
                labels: labelIds.map(labelId => labelsMap.get(labelId) as Label),
            }) as RuleEnriched,
    );

    const rulesMap = new Map<ApiUUID, RuleEnriched>(rulesEnriched.map(rule => [rule.id, rule]));

    rulesEnriched.forEach(rule => {
        const parentId = rule.parentRuleId;
        if (parentId) {
            const parent = rulesMap.get(parentId);
            if (parent) {
                parent.children.push(rule);
            } else {
                console.error('Some rule has a parent and is not found', { ruleId: rule.id, parentId });
            }
        }
    });

    return { rules: rulesEnriched, rulesMap };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const toApiRule = ({ children, labels, ...rule }: RuleEnriched): Rule => {
    return {
        ...rule,
        labelIds: labels.map(label => label.id),
    };
};
