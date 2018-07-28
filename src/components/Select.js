import React from 'react'
import { Select } from 'antd'

const renderOption= (key, value)=>{
    return (<option value={key} key={key}>{value}</option>);
}


const SelectComponent = (props) => {
    var options = [];
    if (props.placeholder){
        options.push(renderOption(props.placeholder.key, props.placeholder.value, props.value))
    }
    options = options.concat(props.options.map((e)=>renderOption(e.key, e.value, props.value)))
    // to share the value with the same type, we create a hash to transform the value
    const hash = {} 
    props.options.forEach(element => {
        hash[element.key]= element.key
    });
    
    return (
        <select className="browser-default"
            onChange={(e)=> {e.preventDefault(); props.onChange(hash[e.target.value]) }}
            value={props.value}>
            {options}
        </select>
    )/*/
    let newProps = props;
    if (props.onChangeFn){
        newProps.onChange=(e)=> {e.preventDefault(); props.onChangeFn(hash[e.target.value]) }
    }
    return (
        <Select {...newProps}
            >
            {options}
        </Select>
    )*/
}



export default SelectComponent;
