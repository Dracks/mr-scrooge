import { Box, Button, Form, Grid, Heading, ResponsiveContext } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApiClient } from '../../api/client';
import { ApiUUID, RuleParam } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { catchAndLog } from '../../utils/promises';
import NotFound from '../extra/not-found';
import { ConditionsList } from './conditions/conditions-list';
import { RuleEnriched } from './rule-enriched';
import { RuleForm } from './rule-form';
import { RuleLabel } from './rule-label';
import { useRuleCtx } from './rule-loaded';

interface EditRuleFormProps {
    id: string;
}

export const EditRule: React.FC<EditRuleFormProps> = ({ id }) => {
    const { map: rulesMap } = useRuleCtx();

    const rule = rulesMap.get(id);
    if (rule) {
        return <EditRuleForm rule={rule} />;
    }
    return <NotFound />;
};

const getRuleParam = ({ groupOwnerId, name, relations, parentRuleId }: RuleEnriched): RuleParam => ({
    groupOwnerId,
    name,
    relations,
    parentRuleId,
});

const getAllChildrenIds = (rule: RuleEnriched): Set<ApiUUID> => {
    const knownChildrenIds = new Set([rule.id]);
    const pendingChildren = [...rule.children];
    while (pendingChildren.length > 0) {
        const first = pendingChildren.pop();
        if (first && !knownChildrenIds.has(first.id)) {
            knownChildrenIds.add(first.id);
            pendingChildren.push(...first.children);
        }
    }
    return knownChildrenIds;
};

const EditRuleForm: React.FC<{ rule: RuleEnriched }> = ({ rule }) => {
    const logger = useLogger('EditRule');
    const { list: allRules, updateRaw } = useRuleCtx();
    const client = useApiClient();
    const [formData, setFormData] = React.useState<RuleParam>(getRuleParam(rule));
    const validParents = React.useMemo(() => {
        const allChildren = getAllChildrenIds(rule);
        return allRules.filter(toCheck => !allChildren.has(toCheck.id));
    }, [rule.id, allRules]);

    const updateRule = useAsyncCallback(async (ruleId: ApiUUID, updatedRule: RuleParam) => {
        const response = await client.PUT('/rules/{ruleId}', { body: updatedRule, params: { path: { ruleId } } });
        if (response.data) {
            updateRaw(response.data);
        }
    });
    React.useEffect(() => {
        setFormData(getRuleParam(rule));
    }, [rule.id]);
    return (
        <Box pad="small">
            <ResponsiveContext.Consumer>
                {size => (
                    <Grid columns={size === 'large' ? ['49%', '49%'] : '100%'} gap="medium">
                        <Box>
                            <Heading data-testid="heading" level="2">
                                Edit rule: {formData.name}
                            </Heading>
                            <Form<RuleParam>
                                value={formData}
                                onChange={newValue => {
                                    setFormData(newValue);
                                }}
                                onSubmit={() => {
                                    catchAndLog(updateRule.execute(rule.id, formData), 'Creating the new rule', logger);
                                }}
                            >
                                <RuleForm availableRules={validParents} />
                                <Box justify="end" direction="row">
                                    <Button primary label="Save" type="submit" disabled={!formData.name} />
                                </Box>
                            </Form>
                        </Box>
                        <Box>
                            <RuleLabel rule={rule} updateRule={updateRaw} />
                            <ConditionsList rule={rule} />
                        </Box>
                    </Grid>
                )}
            </ResponsiveContext.Consumer>
        </Box>
    );
};
