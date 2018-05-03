import React from 'react';

import ConstantsCss from '../Constants-CSS';
import Rest from '../../network/Rest';
import {eventHandler} from '../Utils';
import MessageComponent from '../../components/Message';
import Input from '../../components/Input';
import Select from '../../components/Select';


import TagsFilterTable from './TagsFilterTable';

const negate_options = [
    {key: false, value: "cond1 or cond2 ..."},
    {key: true, value: "not cond1 and not cond2 ..."}
]

const Form = ({value, updateTags, hashTags, tags}) => {
    var showMessage;
    var tag = value;

    var notShownListTags = [];
    if (value.id){
        var listChildren = [value.id];
        while(listChildren.length){
            var first = listChildren.shift()
            notShownListTags.push(first);
            hashTags[first].children.forEach(e=>{
                listChildren.push(e);
            });
        }
    }

    let parent_list = [{key:'', value:'No parent'}].concat(tags
        .filter(({id})=>notShownListTags.indexOf(id)===-1)
        .map(({id, name})=>{return {key:id, value:name}}));

    let save = () => {
        Rest.save('/api/tag/:id/', tag).then(
            (data)=>{
                updateTags();
                tag.id=data.id;
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
        Rest.save('/api/tag/'+tag.id+'/apply_filters/', {}).then(
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

    let destroy = ()=>{
        console.log(tag)
        Rest.destroy('/api/tag/:id/', tag).then(
            (data)=>{
                updateTags()
            }, (error)=>{
                if (showMessage){
                    showMessage(ConstantsCss.Message.Error, "Error", JSON.stringify(error));
                }
            }
        )
    }

    return (
        <div className="row">
            <div className="col s6 ">
                <label>Parent:</label>
                <Select options={parent_list} value={tag.parent} onChange={(e)=>{tag.parent = e; save()}}/>
            </div>
            <div className="col s6 ">
                <label>Management of conditions</label>
                <Select options={negate_options} value={tag.negate_conditional} onChange={(e)=>{tag.negate_conditional=e; save()}}/>
            </div>
            <div className="input-field col s5">
                <Input placeholder="Name" type="text" value={tag.name} onBlur={e=>{tag.name=e; save()}}/>
            </div>
            <div className="input-field col s5">
                <a className={ConstantsCss.Button.Normal} onClick={eventHandler(apply)}>Apply</a>
                <a className={ConstantsCss.Button.Delete + ' ' + ConstantsCss.Button.Normal} onClick={eventHandler(destroy)}>Delete</a>
            </div>
            <div className="col s12">
                <MessageComponent register={(c)=>{showMessage=c}}/>
            </div>
            <div className="col s12">
                <TagsFilterTable tag={value}/>
            </div>
        </div>
    )
}

export default Form;