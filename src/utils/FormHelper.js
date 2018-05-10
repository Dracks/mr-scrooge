import React, { Component } from 'react';
import { eventHandler } from '../app/Utils';

import Input from '../components/Input';
import Select from '../components/Select';

export const getOption=(name, config)=>{
    return {
        name,
        config
    }
}

const FormInputOption = ({name, placeholder, value, callback, children})=>{
    return (
        <div>
            <label>{name}</label>
            <Input placeholder={placeholder} value={value} onBlur={callback} />
            {children}
        </div>
    )
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
class FormMultiSelectOptions extends Component {
    constructor(props){
        super(props);
        this.hashValues = this.props.options.reduce((ac, e)=>{
            ac[e.key]=e;
            return ac;
        }, {})
        this.state = this.getState();
        this.onRemove = this.onRemove.bind(this);
        this.onAdd = this.onAdd.bind(this);
    }
    getState(){
        var listValues = this.props.value;
        if (!(listValues instanceof Array)){
            console.error('Value should be an array');
            listValues = []
        }
        return {
            listValues: listValues
        }
    }
    onRemove(key){
        const listValues = this.state.listValues;
        let atIndex = listValues.indexOf(key);
        listValues.splice(atIndex, 1);
        const newList = listValues.map((e)=>e);
        this.setState({
            listValues: newList
        });
        this.props.callback(newList);
    }
    onAdd(v){
        const newList = this.state.listValues.concat(v);
        this.setState({
            listValues: newList
        })
        this.props.callback(newList)
    }
    render(){
        var {name, placeholder, options, children} = this.props;
        const listValues = this.state.listValues.map((e, index)=>{
            return (
                <div key={index} className="row">
                    {this.hashValues[e].value}
                    <i className="close material-icons" onClick={eventHandler(()=>this.onRemove(e))}>
                        close
                    </i>
                </div>
            )
        });
        return (
            <div>
                <label>{name}</label>
                {listValues}
                <Select placeholder={{key:'', value:placeholder}} options={options} onChange={this.onAdd} />
                {children}
            </div>
        )
    }
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

export const getSelectOptions = helper(FormSelectOption);

export const getMultiSelectOptions = helper(FormMultiSelectOptions);