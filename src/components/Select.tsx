import { Select } from 'antd'
import * as React from 'react'

import { eventHandler } from '../app/Utils';

const Option = Select.Option;
const renderAntdOption = (key, value)=>{
    return (<Option key={key} value={key}>{value}</Option>)
}

export const getOptions = (listOptions) =>
    listOptions.map((e)=>renderAntdOption(e.key, e.value))


const SelectComponent = (props) => {
    const options = getOptions(props.options);
    // to share the value with the same type, we create a hash to transform the value
    const hash = {}
    props.options.forEach(element => {
        hash[element.key]= element.key
    });

    const newProps = {
        onChange: undefined,
        placeholder: props.placeholder ? props.placeholder.value : undefined,
        style: props.style,
        value: props.value,
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

export const MyMultipleSelect = (props)=>{

    let {options, placeholder, onChangeFn, value, ...newProps } = props
    options = getOptions(options);

    if (placeholder && typeof(placeholder) === "object"){
        placeholder = placeholder.value;
    }
    return (
        <Select mode="multiple" onChange={onChangeFn} value={value} placeholder={placeholder} {...newProps}>
            {options}
        </Select>
    )
}


export default SelectComponent;
