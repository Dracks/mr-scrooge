import { Box, FormField, Select, TextInput } from "grommet"
import React from "react"
import { RuleEnriched } from "./rule-enriched"

interface RuleFormProps {
    availableRules: RuleEnriched[]
}

export const RuleForm : React.FC<RuleFormProps> = ({availableRules})=>{
    return <Box direction="row-responsive" justify="center" gap="medium">
        <Box>
            <FormField name="name" label="Rule Name" component={TextInput} />
            <FormField label="Conditions Relations" htmlFor='select-conditions-relations'>
                <Select
                    id="select-conditions-relations"
                    name="relations"
                    options={[{ key: "or", label: "cond1 or cond2 or ..." }, { key: "notAnd", label: "not cond1 and not cond2 and ..." }]}
                    labelKey="label"
                    valueKey={{ key: 'key', reduce: true }} />
            </FormField>
        </Box>
        <Box>
            <FormField label="Parent Rule" htmlFor="select-parent-rule">
                <Select
                    id="select-parent-rule"
                    name="parentRuleId"
                    options={[{name: "No Parent"},...availableRules]}
                    labelKey="name"
                    valueKey={{ key: 'id', reduce: true }} />
            </FormField>
        </Box>
    </Box>

}