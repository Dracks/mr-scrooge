import { Box, Form, Select, TextInput } from 'grommet';
import React from 'react';

import { RuleConditionInput } from '../../../api/models';
import { allOperationsTuples, isOperationDouble, isOperationString } from './condition-helpers';

interface ConditionFormArgs {
    condition: RuleConditionInput;
    actions: React.ReactElement[];
    onSave: () => void;
    onChange: (c: RuleConditionInput) => void;
}

export const ConditionForm: React.FC<ConditionFormArgs> = ({ condition, actions, onChange, onSave }) => {
    let valueFormPart = <Box>Type is not valid</Box>;
    if (isOperationString(condition.operation)) {
        valueFormPart = <TextInput data-testid="condition-value" name="value" />;
    } else if (isOperationDouble(condition.operation)) {
        valueFormPart = <TextInput data-testid="condition-value" name="value" type="number" />;
    }
    return (
        <Form<RuleConditionInput>
            value={condition}
            onChange={data => {
                onChange(data);
            }}
            onSubmit={() => {
                onSave();
            }}
            data-testid="condition-form"
        >
            <Box direction="row">
                <Box width="30%">
                    <Select
                        name="operation"
                        options={allOperationsTuples}
                        labelKey="label"
                        valueKey={{ key: 'key', reduce: true }}
                        data-testid="condition-operation"
                    />
                </Box>
                <Box width="30%">{valueFormPart}</Box>
                <Box width="30%" direction="row">
                    {actions}
                </Box>
            </Box>
        </Form>
    );
};
