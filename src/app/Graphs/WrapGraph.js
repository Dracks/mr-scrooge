import React, {Component} from 'react';

import Form from '../../utils/Form';
import ConstantsCss from '../Constants-CSS';
import { eventHandler } from '../Utils';

import Graph from './Graph';

class WrapGraph extends Component {
    constructor(props){
        super(props)
        this.changeOptions = this.changeOptions.bind(this);
        this.state={
            isEdit: false,
            options: props.options,
        }
    }
    changeOptions(options){
        console.log(options);
        this.setState({options: options})
    }
    render(){
        let g = <Graph data={this.props.data} options={this.props.packer(this.state.options)} />
        if (this.state.isEdit){
            return (
                <div className={this.props.className}>
                    <Form config={this.props.graphConfig} onChange={this.changeOptions} options={this.state.options} />
                    <a className={ConstantsCss.Button.Floating} onClick={eventHandler(()=>{this.setState({isEdit: false})})}><i className="material-icons">save</i></a>
                    {g}
                </div>
                )
        } else {
            return (
                <div className={this.props.className}>
                    {g}
                    <a className={ConstantsCss.Button.Floating} onClick={eventHandler(()=>{this.setState({isEdit: true})})}><i className="material-icons">edit</i></a>
                </div>
                )
        }
    }
}

export default WrapGraph;