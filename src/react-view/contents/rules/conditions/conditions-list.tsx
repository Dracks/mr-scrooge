import { Box, Heading } from 'grommet';
import React from 'react';

import { RuleEnriched } from '../rule-enriched';
import { EditCondition } from './edit-condition';
import { NewCondition } from './new-condition';

export const ConditionsList: React.FC<{ rule: RuleEnriched }> = ({ rule }) => {
    return (
        <>
            <Heading level="3">Conditions</Heading>
            <Box data-testid="conditions-container">
                {rule.conditions.map(condition => (
                    <EditCondition condition={condition} key={condition.id} ruleId={rule.id} />
                ))}
                <NewCondition ruleId={rule.id} />
            </Box>
        </>
    );
};
