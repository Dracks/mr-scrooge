import { Box, Button, Form, Heading } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { useNavigate } from 'react-router';

import { useApi } from '../../api/client';
import { RuleParam } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { catchAndLog } from '../../utils/promises';
import { useUserProfileOrThrows } from '../../utils/session/session-context';
import { RuleForm } from './rule-form';
import { useRuleCtx } from './rule-loaded';

export const NewRuleForm: React.FC = () => {
    const logger = useLogger('RuleNew');
    const { list: allRules, refresh } = useRuleCtx();
    const client = useApi();
    const profile = useUserProfileOrThrows();
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState<RuleParam>({
        groupOwnerId: profile.defaultGroupId,
        name: '',
        relations: 'or',
    });
    const createRule = useAsyncCallback((newRule: RuleParam) => {
        return client.POST('/rules', { body: newRule });
    });
    logger.info('Updated form data', { formData });

    return (
        <Box pad="small">
            <Heading level="2">New Rule</Heading>
            <Form<RuleParam>
                value={formData}
                onChange={newValue => {
                    setFormData(newValue);
                }}
                onSubmit={() => {
                    catchAndLog(
                        createRule.execute(formData).then(response => {
                            refresh();
                            const newRule = response.data;
                            if (newRule) {
                                navigate(`../${newRule.id}`);
                            } else {
                                logger.error('Some error from creating the rule', { error: response.error });
                            }
                        }),
                        'Creating the new rule',
                        logger,
                    );
                }}
            >
                <RuleForm availableRules={allRules} />
                <Button primary label="Create rule" type="submit" disabled={!formData.name} />
            </Form>
        </Box>
    );
};
