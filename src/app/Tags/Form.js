import React from 'react';

import ConstantsCss from '../Constants-CSS';
import Rest from '../../network/Rest';
import {eventHandler} from '../Utils';
import MessageComponent from '../../components/Message';
import Input from '../../components/Input';


import TagsFilterTable from './TagsFilterTable';

const Form = ({value}) => {
    var showMessage;

    let save = (newValue) => {
        value.name = newValue;
        Rest.save('/api/tag/:id/', value).then(
            (data)=>{
                if (showMessage){
                    showMessage(ConstantsCss.Message.Ok, "Saved correctly", JSON.stringify(data));
                }
            }, (error)=>{
                if (showMessage){
                    showMessage(ConstantsCss.Message.Error, "Error", JSON.stringify(error));
                }
            }
        )
    }

    let apply = ()=>{
        Rest.save('/api/tag/'+value.id+'/apply_filters/', {}).then(
            (data)=>{
                if (showMessage){
                    showMessage(ConstantsCss.Message.Ok, "Applied correctly", JSON.stringify(data));
                }
            }, (error)=>{
                if (showMessage){
                    showMessage(ConstantsCss.Message.Error, "Error", JSON.stringify(error));
                }
            }
        )
    }

    return (
        <div className="row">
            <div className="input-field col s6">
                <Input placeholder="Name" type="text" value={value.name} onBlur={save}/>
            </div>
            <div className="input-field col s6">
                <a className={ConstantsCss.Button.Normal} onClick={eventHandler(apply)}>Apply</a>
                <a className={ConstantsCss.Button.Delete}>Delete</a>
            </div>
            <div className="col s12">
                <MessageComponent register={(c)=>{showMessage=c}}/>
            </div>
            <TagsFilterTable />
        </div>
    )
}

export default Form;