import React from 'react';

//import Input from '../components/Input';
import Select from '../components/Select';

export const getOption=(name, config)=>{
    return {
        name,
        config
    }
}


const FormSelectOption = ({name, placeholder, options, value, callback, children})=>{
    return (
            <div>
                <label>{name}</label>
                <Select placeholder={{key:'', value:placeholder}} options={options} value={value} onChange={callback} />
                {children}
            </div>
    )
}

const FormMultiSelectOptions = ({name, placeholder, options, value, callback, children})=>{
    return (
            <div>
                <label>{name}</label>
                <Select placeholder={{key:'', value:placeholder}} options={options} value={value} onChange={callback} />
                {children}
            </div>
    )
}
const helper = (input)=>{
    return (name, placeholder, options)=>{
        return {
            name,
            placeholder,
            options,
            input
        }
    }
}
export const getSelectOptions = helper(FormSelectOption);

export const getMultiSelectOptions = helper(FormMultiSelectOptions);