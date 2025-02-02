import { Box, Heading } from 'grommet';
import React from 'react';

import { RuleCondition } from '../../../api/models';
import { RuleEnriched } from '../rule-enriched';
import { EditCondition } from './edit-condition';
import { NewCondition } from './new-condition';

export const ConditionsList: React.FC<{ rule: RuleEnriched }> = ({ rule }) => {
    const [conditions, setConditions] = React.useState<RuleCondition[]>(rule.conditions);

    React.useEffect(() => {
        setConditions(rule.conditions);
    }, [rule.id]);

    return (
        <>
            <Heading level="3">Conditions</Heading>
            <Box data-testid="conditions-container">
                {conditions.map(condition => (
                    <EditCondition condition={condition} key={condition.id} ruleId={rule.id} />
                ))}
                <NewCondition ruleId={rule.id} />
            </Box>
        </>
    );
};
