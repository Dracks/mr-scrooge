import { Select } from 'antd'
import * as React from 'react'

import { eventHandler } from '../app/Utils';

interface IPairData {
    key: string | boolean | number,
    value: string
}

interface IMySelectProps{
    options: IPairData[]
    placeholder?: string | IPairData
    style?: any
    value: string
    onChangeFn: any
}

const Option = Select.Option;
const renderAntdOption = (key, value)=>{
    return (<Option key={key} value={key}>{value}</Option>)
}

export const getOptions = (listOptions: IPairData[]) =>
    listOptions.map((e)=>renderAntdOption(e.key, e.value))

const SelectComponent = (props: IMySelectProps) => {
    const options = getOptions(props.options);
    // to share the value with the same type, we create a hash to transform the value
    const hash = {}
    props.options.forEach(element => {
        hash[element.key]= element.key
    });

    let newPlaceholder :string = undefined;
    if (props.placeholder){
        if (typeof props.placeholder === "object"){
            newPlaceholder = props.placeholder.value
        } else {
            newPlaceholder = props.placeholder;
        }
    }

    const newProps = {
        onChange: undefined,
        placeholder: newPlaceholder,
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

export const MyMultipleSelect = (props: IMySelectProps)=>{
    /* tslint:disable-next-line prefer-const*/
    let {options, placeholder, onChangeFn, value, ...newProps } = props
    let optionsView = getOptions(options);

    if (placeholder && typeof(placeholder) === "object"){
        placeholder = placeholder.value;
    }
    return (
        <Select mode="multiple" onChange={onChangeFn} value={value} placeholder={placeholder} {...newProps}>
            {optionsView}
        </Select>
    )
}


export default SelectComponent;
