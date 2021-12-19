import { Select } from 'antd'
import * as React from 'react'

import { eventHandler } from '../app/Utils';

type SelectIndex = string | boolean | number
type SelectValue = string | number

export interface IPairData {
    key: SelectIndex,
    value: string
}

interface IAbstractSelectProps {
    options: IPairData[]
    placeholder?: string | IPairData
    style?: any
    onChangeFn: any
    filterOption?: (a:any, b:any)=>boolean
}

export interface IMySelectProps extends IAbstractSelectProps {
    value: SelectValue
}

export interface IMyMultiSelectProps extends IAbstractSelectProps {
    value: SelectValue[]
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
    props.options.forEach(({key}) => {
        const indexKey = typeof key ==="boolean" ? String(key) : key
        hash[indexKey]= key
    });

    let newPlaceholder :string;
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

export const MyMultipleSelect = (props: IMyMultiSelectProps)=>{
    /* tslint:disable-next-line prefer-const*/
    let {options, placeholder, onChangeFn, value, ...newProps } = props
    const optionsView = getOptions(options);

    if (placeholder && typeof(placeholder) === "object"){
        placeholder = placeholder.value;
    }
    return (
        <Select mode="multiple" onChange={onChangeFn} value={value as any} placeholder={placeholder} {...newProps}>
            {optionsView}
        </Select>
    )
}


export default SelectComponent;
