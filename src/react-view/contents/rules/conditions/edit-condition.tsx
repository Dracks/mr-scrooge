import { Button } from 'grommet';
import React, { useState } from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApiClient } from '../../../api/client';
import { ApiUUID, RuleCondition, RuleConditionInput } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { catchAndLog } from '../../../utils/promises';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { useRuleCtx } from '../rule-loaded';
import { ConditionForm } from './condition-form';

export const EditCondition: React.FC<{ condition: RuleCondition; ruleId: ApiUUID }> = ({ condition, ruleId }) => {
    const logger = useLogger('Edit condition');
    const client = useApiClient();
    const { updateRaw } = useRuleCtx();

    const [editCondition, setEditCondition] = useState<RuleCondition>(condition);
    React.useEffect(() => {
        setEditCondition(condition);
    }, [condition.id]);

    const saveCondition = useAsyncCallback(async (updatedCondition: RuleConditionInput) => {
        const response = await client.PUT('/rules/{ruleId}/condition/{condId}', {
            body: { condition: updatedCondition },
            params: { path: { ruleId, condId: condition.id } },
        });
        if (response.data) {
            updateRaw(response.data);
        }
    });

    const deleteCondition = useAsyncCallback(async () => {
        const response = await client.DELETE('/rules/{ruleId}/condition/{condId}', {
            params: { path: { ruleId, condId: condition.id } },
        });
        if (response.data) {
            updateRaw(response.data);
        }
    });

    return (
        <ConditionForm
            condition={editCondition}
            actions={[
                <Button label="Save" type="submit" key="save" data-testid="save-condition-button" />,
                <Button
                    color="accent-4"
                    label="Discard"
                    onClick={() => {
                        setEditCondition(condition);
                    }}
                    key="discard"
                />,
                <ConfirmationButton
                    key="delete"
                    color="accent-4"
                    label="Delete"
                    onConfirm={() => {
                        catchAndLog(deleteCondition.execute(), 'Deleting the condition', logger);
                    }}
                />,
            ]}
            onSave={() => {
                catchAndLog(saveCondition.execute(editCondition), 'Saving the condition', logger);
            }}
            onChange={data => {
                setEditCondition({ ...editCondition, ...data });
            }}
        />
    );
};
