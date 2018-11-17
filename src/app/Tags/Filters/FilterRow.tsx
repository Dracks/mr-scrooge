import { Input } from 'antd';
import * as React from 'react';

import { Danger } from '../../../components/dessign/buttons';
import Select from '../../../components/Select';
import { eventHandler } from '../../Utils';


const FilterRowEmpty = ({filter, types, saveFilter, deleteFilter}) => {
    const options = Object.keys(types).map((e)=> ({"key":e, "value":types[e]}))
    const save=()=>{
        saveFilter(filter)
    }
    const deleteRow=()=>{
        deleteFilter(filter)
    }
    const selectFilter = (e)=>{filter.type_conditional=e; save()}
    const inputFilter = (e)=>{filter.conditional=e.target.value; save()}
    return (
        <tr>
            <td><Select options={options} placeholder="Select" value={filter.type_conditional} onChangeFn={selectFilter} style={{width:"100%"}}/></td>
            <td><Input defaultValue={filter.conditional} onBlur={inputFilter}/></td>
            <td><Danger onClick={eventHandler(deleteRow)}> Delete </Danger></td>
        </tr>
    )
}

export default FilterRowEmpty