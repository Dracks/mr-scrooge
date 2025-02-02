import { Button } from 'grommet';
import { useState } from 'react';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApiClient } from '../../../api/client';
import { ApiUUID, RuleConditionParam } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { catchAndLog } from '../../../utils/promises';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { useRuleCtx } from '../rule-loaded';
import { ConditionForm } from './condition-form';

export const NewCondition: React.FC<{ ruleId: ApiUUID }> = ({ ruleId }) => {
    const logger = useLogger('New Condition');
    const client = useApiClient();

    const { updateRaw } = useRuleCtx();

    const [newCondition, setNewCondition] = useState<RuleConditionParam>({
        operation: 'contains',
        value: '',
    });
    const reset = () => {
        setNewCondition({ operation: 'contains', value: '' });
    };

    const createCondition = useAsyncCallback(async (newCondition: RuleConditionParam) => {
        const response = await client.POST('/rules/{ruleId}/condition', {
            body: { condition: newCondition },
            params: { path: { ruleId } },
        });
        if (response.data) {
            updateRaw(response.data);
            reset();
        }
    });

    return (
        <ConditionForm
            condition={newCondition}
            actions={[
                <Button label="create" type="submit" key="create" data-testid="create-condition-button" />,
                <ConfirmationButton
                    key="reset"
                    color="accent-4"
                    label="Discard"
                    onConfirm={() => {
                        reset();
                    }}
                />,
            ]}
            onSave={() => {
                catchAndLog(createCondition.execute(newCondition), 'Creating a new condition', logger);
            }}
            onChange={updatedCond => {
                setNewCondition(updatedCond);
            }}
        />
    );
};
