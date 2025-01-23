import { Box, Form,Select, TextInput} from "grommet";
import React from 'react'

import { RuleConditionParam } from "../../../api/models";
import { allOperationsTuples, isOperationDouble, isOperationString } from "./condition-helpers";


interface ConditionFormArgs {
    condition: RuleConditionParam,
    actions: React.ReactElement[],
    onSave: ()=>void,
    onChange: (c: RuleConditionParam)=>void
}

export const ConditionForm: React.FC<ConditionFormArgs> = ({condition, actions, onChange, onSave})=>{
    let valueFormPart = <Box >Type is not valid</Box>
    if (isOperationString(condition.operation)){
        valueFormPart = <TextInput name="value"/>
    } else if (isOperationDouble(condition.operation)){
        valueFormPart = <TextInput name="value" type="number" />
    }
    return <Form<RuleConditionParam>
        value={condition}
        onChange={data => { onChange(data) }}
        onSubmit={() => { onSave() }}
    >
        <Box direction="row">
            <Box width="30%">
                <Select 
                    name="operation"
                    options={allOperationsTuples}
                    labelKey="label"
                    valueKey={{key: 'key', reduce: true}}
                />
            </Box>
            <Box width="30%">
                {valueFormPart}
            </Box>
            <Box width="30%" direction="row">
                {actions}
            </Box>
        </Box>
    </Form>
}