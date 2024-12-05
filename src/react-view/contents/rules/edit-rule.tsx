import React from 'react'
import { useRuleCtx } from './rule-loaded'
import { RuleEnriched } from './rule-enriched'
import NotFound from '../extra/not-found'
import { ApiUUID, Label, RuleParam } from '../../api/models'
import { Box, Heading, Form, Button } from 'grommet'
import { catchAndLog } from '../../utils/promises'
import { RuleForm } from './rule-form'
import { useLogger } from '../../utils/logger/logger.context'
import { useApi } from '../../api/client'
import { useAsyncCallback } from 'react-async-hook'
import { LabelInput } from '../../utils/ui/label-selector'
import { useLabelsContext } from '../common/label.context'

interface EditRuleFormProps {
    id: string
}

export const EditRule: React.FC<EditRuleFormProps> = ({ id })=>{
    const {map: rulesMap} = useRuleCtx()
    
    const rule = rulesMap.get(id)
    if (rule){
        return <EditRuleForm rule={rule} />
    }
    return <NotFound />
}

const getRuleParam=({groupOwnerId, name, relations, parentRuleId}: RuleEnriched):RuleParam => ({
    groupOwnerId,
    name,
    relations,
    parentRuleId
})

const getAllChildrenIds = (rule: RuleEnriched): Set<ApiUUID> => {
    const knownChildrenIds = new Set([rule.id])
    const pendingChildren = [...rule.children]
    while (pendingChildren.length>0) {
        const first = pendingChildren.pop()
        if (first && !knownChildrenIds.has(first.id)) {
            knownChildrenIds.add(first.id)
            pendingChildren.push(...first.children)
        }
    }
    return knownChildrenIds
}

const EditRuleForm: React.FC<{rule: RuleEnriched}> = ({rule})=>{
    const logger = useLogger("EditRule")
    const {list: allRules, refresh} = useRuleCtx()
    const {labels: allLabels} = useLabelsContext()
    const possibleLabels = allLabels.filter(({ groupOwnerId }) => rule.groupOwnerId === groupOwnerId);
    const client = useApi()
    const [formData, setFormData] = React.useState<RuleParam>(getRuleParam(rule))
    const [labels, setLabels] = React.useState<Label[]>([])
    const validParents = React.useMemo(()=>{
        const allChildren = getAllChildrenIds(rule)
       return allRules.filter(toCheck => !allChildren.has(toCheck.id)) 
    }, [rule.id, allRules])
    
    const updateRule = useAsyncCallback((ruleId: ApiUUID, updatedRule: RuleParam)=>{
        return client.PUT("/rules/{ruleId}", {body: updatedRule, params: {path: {ruleId}}})
    })
    React.useEffect(()=>{
        setFormData(getRuleParam(rule))
        setLabels(rule.labels)
    }, [rule.id])
    return <Box pad="small">
        <Heading level="2">Edit rule {formData.name}</Heading>
        <Form<RuleParam> 
            value={formData} 
            onChange={newValue => {
                setFormData(newValue)
            }}
            onSubmit={()=>{
                catchAndLog(updateRule.execute(rule.id, formData).then(() => { refresh() }), "Creating the new rule", logger)
            }}
        >
            <RuleForm availableRules={validParents} />
            <Button
                    primary
                    label="Save"
                    type="submit"
                    disabled={!formData.name} />
        </Form>
        <Heading level="3">Labels to assign</Heading>
        <LabelInput 
        value={labels} 
        onAdd={label => { setLabels(labels => [...labels, label]) }}
        onRemove={label => {setLabels(labels => labels.filter(test => test.id != label.id))}}
        suggestions={possibleLabels.filter(label => !labels.includes(label))}
        />
    </Box>
}