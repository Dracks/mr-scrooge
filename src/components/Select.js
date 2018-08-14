import React from 'react'
import { Select } from 'antd'

import { eventHandler } from '../app/Utils';

const Option = Select.Option;
const renderAntdOption = (key, value)=>{
    return (<Option value={key} key={key}>
        {value}
    </Option>)
}

const SelectComponent = (props) => {
    const options = props.options.map((e)=>renderAntdOption(e.key, e.value, props.value))
    // to share the value with the same type, we create a hash to transform the value
    const hash = {} 
    props.options.forEach(element => {
        hash[element.key]= element.key
    });

    let newProps = {
        value: props.value,
        style: props.style,
        placeholder: props.placeholder.value
    };
    if (props.onChangeFn){
        newProps.onChange=(e)=> {
            eventHandler(props.onChangeFn(hash[e]))
        }
    }
    return (
        <Select {...newProps}>
            {options}
        </Select>
    )
}


export default SelectComponent;
