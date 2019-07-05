import { Checkbox, Input } from 'antd';
import * as React from 'react';

// import Input from '../components/Input';
import Select, {MyMultipleSelect} from '../components/Select';
import { selectFilterByContents } from './Select';

/* tslint:disable object-literal-sort-keys */

export const getOption=(name, config?)=>{
    return {
        config,
        name,
    }
}

const FormInputOption = ({name, placeholder, value, callback, children})=>{
    const props = {
        placeholder,
        value,
        onChange: e=>callback(e.target.value)
    }
    return (
        <div>
            <label>{name}</label>
            <Input {...props} />
            {children}
        </div>
    )
}

const FormBooleanOption = ({name, value, callback}) => {
    const props = {
        onChange: ()=>callback(!value),
        checked: value
    }
    return (
        <div>
            <label>{name}</label>
            <Checkbox {...props}/>
        </div>
    )
}

const FormSelectOption = ({name, placeholder, options, value, callback, children})=>{
    return (
            <div>
                <label>{name}</label>
                <Select placeholder={{key:'', value:placeholder}} options={options} value={value} style={{ width: '100%' }} onChangeFn={callback} />
                {children}
            </div>
    )
}

const FormMultiSelectOptions = ({name, placeholder, options, value, callback, children})=>{
    return (
            <div>
                <label>{name}</label>
                <MyMultipleSelect
                    placeholder={{key:'', value:placeholder}}
                    options={options}
                    value={value}
                    style={{ width: '100%' }}
                    filterOption={selectFilterByContents}
                    onChangeFn={callback} />
                {children}
            </div>
    )
}

const FormHiddenOptions = (d: string)=>({value, callback})=>{
    if (d!==value) {
        setTimeout(()=>callback(d), 100)
    }
    return <div />
}

const helper = (input)=>{
    return (name, placeholder, options, kind="str")=>{
        return {
            name,
            placeholder,
            options,
            input,
            kind,
        }
    }
}

export const getHiddenOptions = (name, d:string) => {
    return {
        name, 
        input: FormHiddenOptions(d),
        options: {},
        kind: "str"
    }
}

export const getInputOptions = (name, placeholder)=>{
    return {
        name,
        placeholder,
        input: FormInputOption,
        options: {},
        kind: "str",
    }
}

export const getBooleanOptions = (name, options) =>{
    return {
        name,
        input: FormBooleanOption,
        options,
        kind: "bool"
    }
}

export const getSelectOptions = helper(FormSelectOption);

export const getMultiSelectOptions = helper(FormMultiSelectOptions);