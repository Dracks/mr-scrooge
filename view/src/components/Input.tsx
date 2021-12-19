import * as React from 'react';
import { Component } from 'react';

import {eventHandler} from '../app/Utils';

class Input extends Component<any> {

    private value;
    private eventsObject;

    constructor(props){
        super(props)

        this.value = props.value;
        this.eventsObject = {};
        if (this.props.onBlur){
            this.eventsObject.onBlur = eventHandler((e)=>{this.props.onBlur(this.value)})
        }

        this.state = this.getState();

        this.onChange = this.onChange.bind(this)
        this.getState = this.getState.bind(this)
    }

    public componentWillReceiveProps(newProps) {
        if (newProps !== this.props){
            this.value = newProps.value;
            this.setState(this.getState);
        }
    }

    public getState(){
        const state = {
            onChange: eventHandler((e)=>{this.onChange(e)}),
            placeholder: this.props.placeholder,
            type: this.props.type || "text",
            value: this.value,
        }

        return Object.assign(state, this.eventsObject);
    }

    public onChange(e){
        this.value = e.target.value
        if (this.props.onChange){
            this.props.onChange(e);
        }
        this.setState(this.getState())
    }

    public render(){
        return <input {...this.state}/>
    }
}

export default Input;