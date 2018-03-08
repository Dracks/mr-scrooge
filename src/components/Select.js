import React, { Component } from 'react'


const renderOption= (key, value, selected)=>{
    return (<option value={key} key={key}>{value}</option>);
}


export default function SelectComponent(props) {
    var options = [];
    if (props.placeholder){
        options.push(renderOption(props.placeholder.key, props.placeholder.value, props.value))
    }
    options = options.concat(props.options.map((e)=>renderOption(e.key, e.value, props.value)))
    return (
        <select className="browser-default"
            onChange={(e)=> {e.preventDefault(); props.onChange(e.target.value) }}
            value={props.value}>
            {options}
        </select>
        )
}