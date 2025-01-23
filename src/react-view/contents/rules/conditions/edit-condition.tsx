import { Button } from 'grommet';
import React, {useState} from 'react';

import { RuleCondition } from '../../../api/models';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { ConditionForm } from "./condition-form";

export const EditCondition: React.FC<{condition: RuleCondition}> = ({condition}) => {
    const [editCondition, setEditCondition] = useState<RuleCondition>(condition)
    React.useEffect(()=>{
        setEditCondition(condition)
    }, [condition.id])
    
    return <ConditionForm 
    condition={editCondition} 
    actions={[
        <Button label="Save" type="submit" key="save"/>,
        <Button color="accent-4" label="Discard" onClick={()=>{}} key="discard"/>,
    <ConfirmationButton
        key="delete"
        color="accent-4"
        label="delete"
        onConfirm={()=>{}} />
    ]} 
    onSave={() => undefined} 
    onChange={(data) => { setEditCondition({...editCondition, ...data}) }}/>
}