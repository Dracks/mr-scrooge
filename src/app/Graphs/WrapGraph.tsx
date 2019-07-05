import * as React from 'react';
import { Component } from 'react';

import { Danger, Normal, Primary } from '../../components/dessign/buttons';
import { Cancel, Delete, Edit, Save } from '../../components/dessign/icons';
import { Warning } from '../../components/dessign/messages';
import Form from '../../utils/Form';
import { eventHandler } from '../Utils';

import Graph from './Graph';

type Callback = ()=>void;

class WrapGraph extends Component<any, any> {
    private cancel: Callback;
    private save: Callback;
    private destroy: Callback;

    constructor(props){
        super(props)
        this.changeOptions = this.changeOptions.bind(this);
        this.state={
            isEdit: props.edit || false,
            options: {...props.options},
        }
        this.cancel = this._cancel.bind(this);
        this.save = this._save.bind(this);
        this.destroy = this._destroy.bind(this);
    }
    public changeOptions(options){
        this.setState({options})
    }
    public _cancel(){
        this.setState({
            isEdit: false,
            options: this.props.options
        });
    }
    public _save(){
        this.setState({isEdit: false});
        this.props.save(this.state.options);
    }
    public _destroy(){
        this._cancel();
        this.props.destroy(this.props.options);
    }
    public render(){
        const graphOptions = this.props.packer(this.state.options)
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