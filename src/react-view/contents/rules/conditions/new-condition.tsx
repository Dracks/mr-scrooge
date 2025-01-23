import { Button } from "grommet"
import { useState } from "react"
import React from "react"

import { RuleConditionParam } from "../../../api/models"
import { ConfirmationButton } from "../../../utils/ui/confirmation-button"
import { ConditionForm } from "./condition-form"

export const NewCondition: React.FC<{}> = ()=>{
    const [newCondition, setNewCondition] = useState<RuleConditionParam>({
        operation: "contains",
        value: ""
    })
    const reset = ()=>{
        setNewCondition({operation: 'contains', value: ""})
    }
    return <ConditionForm 
    condition={newCondition} 
    actions={[
        <Button label="create" type="submit" key="create"/>,
        <ConfirmationButton
            key="reset"
            color="accent-4"
            label="Discard"
            onConfirm={()=>{reset()}} />
    ]}
        onSave={()=>undefined}
        onChange={updatedCond => { setNewCondition(updatedCond) }}
    />
}