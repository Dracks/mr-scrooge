import React from 'react';
import { Input } from 'antd';

import Rest from '../../../network/Rest'

import { Danger } from '../../../components/dessign/buttons';
import Select from '../../../components/Select';
import { eventHandler } from '../../Utils';


const FilterRowEmpty = ({filter, types, onDelete}) => {
    const options = Object.keys(types).map((e)=>{ return {"key":e, "value":types[e]}})
    const save=()=>{
        Rest.save('/api/tag-filter/:id/',filter).then(data=>{
            filter = data;
        })
    }
    const deleteRow=()=>{
        Rest.destroy('/api/tag-filter/:id/', filter).then((data)=>{
            onDelete(filter);
        })
    }
    return (
        <tr>
            <td><Select options={options} placeholder="Select" value={filter.type_conditional} onChangeFn={(e)=>{filter.type_conditional=e; save()}} style={{width:"100%"}}/></td>
            <td><Input defaultValue={filter.conditional} onBlur={(e)=>{filter.conditional=e.target.value; save()}}/></td>
            <td><Danger onClick={eventHandler(deleteRow)}> Delete </Danger></td>
        </tr>
    )
}

export default FilterRowEmpty