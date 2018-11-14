import { Checkbox, Input } from 'antd';
import * as React from 'react';

// import Input from '../components/Input';
import Select, {MyMultipleSelect} from '../components/Select';

export const getOption=(name, config?)=>{
    return {
        name,
        config
    }
}

const FormInputOption = ({name, placeholder, value, callback, children})=>{
    return (
        <div>
            <label>{name}</label>
            <Input placeholder={placeholder} value={value} onChange={e=>callback(e.target.value)} />
            {children}
        </div>
    )
}

const FormBooleanOption = ({name, value, callback}) => {
    return (
        <div>
            <label>{name}</label>
            <Checkbox onChange={()=>callback(!value)} checked={value}/>
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
                    onChangeFn={callback} />
                {children}
            </div>
    )
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