import * as React from 'react';
import { Component } from 'react';

import Form from '../../utils/Form';
import { eventHandler } from '../Utils';
import { Save, Delete, Edit, Cancel } from '../../components/dessign/icons';
import { Normal, Primary, Danger } from '../../components/dessign/buttons';
import { Warning } from '../../components/dessign/messages';

import Graph from './Graph';


class WrapGraph extends Component<any, any> {
    private cancel;

    constructor(props){
        super(props)
        this.changeOptions = this.changeOptions.bind(this);
        this.state={
            isEdit: props.edit || false,
            options: props.options,
        }
        this.cancel = eventHandler(this._cancel.bind(this));
    }
    changeOptions(options){
        this.setState({options: options})
    }
    _cancel(){
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
        this._cancel();
        this.props.destroy(this.props.options);
    }
    render(){
        let graphOptions = this.props.packer(this.state.options)
        let g= <Warning message="Graph not configured well" />
        if (graphOptions){
            g = <Graph data={this.props.data} options={graphOptions} />
        }
        if (this.state.isEdit){
            let actionsList = [
                <Primary shape="circle" key="save" id="save" onClick={this.save}>
                    <Save />
                </Primary>,
                <Danger shape="circle" key="delete" id="delete" onClick={this.destroy}>
                    <Delete />
                </Danger>,
            ]
            if (this.state.options.id) {
                actionsList = [
                    actionsList[0],
                    <Normal shape="circle" key="cancel" id="cancel" onClick={this.cancel}>
                        <Cancel />
                    </Normal>,
                    actionsList[1]
                ]
            }
            return (
                <div className={this.props.className}>
                    <Form config={this.props.graphConfig} onChange={this.changeOptions} options={this.state.options} />
                    {g}
                    {actionsList}
                </div>
                )
        } else {
            return (
                <div className={this.props.className}>
                    {g}
                    <Normal shape="circle" id="edit" onClick={eventHandler(()=>{this.setState({isEdit: true})})}>
                        <Edit />
                    </Normal>
                </div>
                )
        }
    }
}

export default WrapGraph;