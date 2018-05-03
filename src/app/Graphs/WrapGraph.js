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
            isEdit: props.edit || false,
            options: props.options,
        }
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.destroy = this.destroy.bind(this);
    }
    changeOptions(options){
        this.setState({options: options})
    }
    cancel(){
        this.setState({
            isEdit: false, 
            options: this.props.options
        });
    }
    save(){
        this.setState({isEdit: false});
        this.props.save(this.state.options);
    }
    destroy(){
        this.cancel();
        this.props.destroy(this.props.options);
    }
    render(){
        let g = <Graph data={this.props.data} options={this.props.packer(this.state.options)} />
        if (this.state.isEdit){
            return (
                <div className={this.props.className}>
                    <Form config={this.props.graphConfig} onChange={this.changeOptions} options={this.state.options} />
                    {
                        [['cancel', ConstantsCss.Button.Cancel, this.cancel], 
                         ['save', ConstantsCss.Button.Save, this.save],
                         ['delete', ConstantsCss.Button.Delete, this.destroy]
                        ].map(([label, color, callback])=>(
                            <a key={label} className={ConstantsCss.Button.Floating+' '+ color } onClick={eventHandler(callback)}>
                                <i className="material-icons">{label}</i>
                            </a>
                        ))
                    }
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