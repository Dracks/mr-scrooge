import React from 'react';

import ConstantsCss from '../Constants-CSS';
import {saveElement} from '../Utils';
import MessageComponent from '../../components/Message';
import Input from '../../components/Input';


import TagsFilterTable from './TagsFilterTable';

const Form = ({value}) => {
    var showMessage;

    let save = (newValue) => {
        value.name = newValue;
        saveElement('/api/tag/:id/', value).then(
            (data)=>{
                console.log(data);
                if (showMessage){
                    showMessage(ConstantsCss.Message.Ok, "Saved correctly", data);
                }
            }, (error)=>{
                console.log(error);
                if (showMessage){
                    showMessage(ConstantsCss.Message.Error, "Error", error);
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
                <a className={ConstantsCss.Button.Normal}>Apply</a>
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