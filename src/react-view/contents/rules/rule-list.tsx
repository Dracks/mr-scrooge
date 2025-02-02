import { Box, Button, Heading, Tag } from 'grommet';
import { Add } from 'grommet-icons';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { useNavigate } from 'react-router';

import { useApiClient } from '../../api/client';
import { useLogger } from '../../utils/logger/logger.context';
import { catchAndLog } from '../../utils/promises';
import { ConfirmationButton } from '../../utils/ui/confirmation-button';
import { RuleEnriched } from './rule-enriched';
import { useRuleCtx } from './rule-loaded';

const RuleSummary: React.FC<{ rule: RuleEnriched }> = ({ rule }) => {
    const navigate = useNavigate();
    const logger = useLogger('Rule Summary');
    const client = useApiClient();
    const { refresh } = useRuleCtx();

    const deleteRule = useAsyncCallback(async () => {
        const response = await client.DELETE('/rules/{ruleId}', { params: { path: { ruleId: rule.id } } });
        if (response.response.status === 200) {
            refresh(rule);
        }
    });
    return (
        <Box>
            <Box direction="row-responsive" gap="small">
                <Box>
                    <Heading level="3">{rule.name}</Heading>
                    <Box direction="row-responsive">
                        <Tag name="labels" value={String(rule.labels.length)} />
                        <Tag name="conditions" value={String(rule.conditions.length)} />
                    </Box>
                </Box>
                <Box justify="center">
                    <Box direction="row" gap="small">
                        <Button
                            primary
                            label="Edit"
                            onClick={() => {
                                navigate(`/rule/${rule.id}`);
                            }}
                        />
                        <ConfirmationButton
                            primary
                            label="Delete"
                            onConfirm={() => {
                                catchAndLog(deleteRule.execute(), 'Deleting a rule', logger);
                            }}
                        />
                    </Box>
                </Box>
            </Box>
            {rule.children.length > 0 ? <RuleSubList rules={rule.children} /> : undefined}
        </Box>
    );
};

const RuleSubList: React.FC<{ rules: RuleEnriched[] }> = ({ rules }) => {
    return (
        <Box pad="small">
            {rules.map(rule => (
                <RuleSummary rule={rule} key={rule.id} />
            ))}
        </Box>
    );
};

const AddRulePlaceholder: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Box pad="small" background="light-2" justify="center" align="center">
            <Button
                icon={<Add size="medium" />}
                onClick={() => {
                    navigate(`/rule/new-rule`);
                }}
            />
        </Box>
    );
};

export const RuleList: React.FC = () => {
    const logger = useLogger('RulesList');
    const { list: allRules } = useRuleCtx();
    const rules = allRules.filter(rule => !rule.parentRuleId);
    logger.info('Rules after filter', { count: rules.length });
    return (
        <Box pad="small">
            <Box align="center" justify="center">
                <Heading level="2">Rules List</Heading>
            </Box>
            <RuleSubList rules={rules} />
            <AddRulePlaceholder />
        </Box>
    );
};
