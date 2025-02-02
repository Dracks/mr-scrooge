import { Box, Heading } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApiClient } from '../../api/client';
import { ApiUUID, Label, Rule } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { catchAndLog } from '../../utils/promises';
import { LabelInput } from '../../utils/ui/label-selector';
import { useLabelsContext } from '../common/label.context';
import { RuleEnriched } from './rule-enriched';

export const RuleLabel: React.FC<{ rule: RuleEnriched; updateRule: (r: Rule) => void }> = ({ rule, updateRule }) => {
    const logger = useLogger();
    const client = useApiClient();
    const { labels: allLabels } = useLabelsContext();
    const [labels, setLabels] = React.useState<Label[]>([]);
    const possibleLabels = allLabels.filter(({ groupOwnerId }) => rule.groupOwnerId === groupOwnerId);

    React.useEffect(() => {
        setLabels(rule.labels);
    }, [rule.id]);

    const addLabel = useAsyncCallback(async (ruleId: ApiUUID, labelId: ApiUUID): Promise<void> => {
        const response = await client.PUT('/rules/{ruleId}/label/{labelId}', { params: { path: { ruleId, labelId } } });
        if (response.data) {
            updateRule(response.data);
        }
    });

    const removeLabel = useAsyncCallback(async (ruleId: ApiUUID, labelId: ApiUUID): Promise<void> => {
        const response = await client.DELETE('/rules/{ruleId}/label/{labelId}', {
            params: { path: { ruleId, labelId } },
        });
        if (response.data) {
            updateRule(response.data);
        }
    });

    return (
        <>
            <Heading level="3">Labels to assign</Heading>
            <Box>
                <LabelInput
                    data-testid="label-list"
                    value={labels}
                    onAdd={label => {
                        setLabels(labels => [...labels, label]);
                        catchAndLog(addLabel.execute(rule.id, label.id), 'Error adding a label to the rule', logger);
                    }}
                    onRemove={label => {
                        setLabels(labels => labels.filter(test => test.id != label.id));
                        catchAndLog(
                            removeLabel.execute(rule.id, label.id),
                            'Error removing a label from the rule',
                            logger,
                        );
                    }}
                    suggestions={possibleLabels.filter(label => !labels.includes(label))}
                />
            </Box>
        </>
    );
};
