import React, {Component} from 'react';

import Input from '../components/Input';
import Select from '../components/Select';

const getConfigView=(struct, state, callback)=>{
    return Object.keys(struct).filter((e)=>{
        return struct[e].config;
    }).map((property, index)=>{
        var c=struct[property];
        var options = Object.keys(c.config).map((e)=>{ return { value: c.config[e].name, key: e}});
        var value = state[property];
        var children = [];
        if (value){
            if (c.config[value]){
                children = getConfigView(c.config[value].config, state, callback)
            } else {
                console.error(value + ' value not found in '+JSON.stringify(c.config));
            }
        }
        return (
                <div key={index} >
                    <label>{c.placeholder}</label>
                    <Select placeholder={{key:'', value:c.placeholder}} options={options} value={value} />
                    {children}
                </div>
            )
    })
}

class Form extends Component{
    constructor(props){
        super(props);
        this.state = props.options || {};
        this.changeProperty = this.changeProperty.bind(this);
    }

    changeProperty(property, value){
        let change= {[property]:value};
        this.setState(change);
        if (this.props.onChange){
            const state = Object.assign(change, this.state)
            this.props.onChange(state);
        }
    }

    render(){
        return (
            <div className="row">
                {getConfigView(this.props.config, this.state, this.changeProperty)}
            </div>
        )
    }
}

export default Form;