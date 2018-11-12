import * as React from 'react';
import { Component } from 'react';

import {eventHandler} from '../app/Utils';

class Checkbox extends Component<any> {
    private value;
    private eventsObject;
    
    constructor(props){
        super(props)

        this.value = props.value;
        this.eventsObject = {
            onChange: eventHandler((e)=>{this.onChange(e)}),
        };
        
        this.state = this.getState();

        this.onChange = this.onChange.bind(this)
        this.getState = this.getState.bind(this)
    }

    getState(){
        var state = {
            checked: this.value
        }

        return Object.assign(state, this.eventsObject);
    }

    onChange(e){
        this.value = e.target.checked
        if (this.props.onChange){
            this.props.onChange(this.value);
        }
        this.setState(this.getState())
    }

    render(){
        return <input
                id={this.props.id}
                type="checkbox"
                checked={this.value}
                onChange={(e)=>{e.preventDefault(); alert("Surprise me!");}} />
    }
}
export default Checkbox;