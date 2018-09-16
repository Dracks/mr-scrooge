import React from 'react';
import { 
    Select,
    Form,
    Input,
    Row
} from 'antd';

import { half, oneThird, twoThird } from '../../components/dessign/grid'
import { Primary, Danger } from '../../components/dessign/buttons'

import {eventHandler} from '../Utils';
//import MessageComponent from '../../components/Message';
//import Input from '../../components/Input';
import { getOptions } from '../../components/Select';

const formLayout = {
    labelCol: {
        span: 24
    },
    wrapperCol: {
        span: 24
    },
}

const negate_options = [
    {key: false, value: "cond1 or cond2 ..."},
    {key: true, value: "not cond1 and not cond2 ..."}
]

const FormItem = Form.Item;
const FormTag = ({value, saveTag, destroyTag, applyFilters, hashTags, tags, form}) => {
    const { getFieldDecorator } = form;
    var tag = value;
    const propsButtons = tag.id ? {} : {disabled:true};

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

    let parent_list = tags
        .filter(({id})=>notShownListTags.indexOf(id)===-1)
        .map(({id, name})=>{return {key:id, value:name}});

    let apply = ()=>{
        applyFilters(tag)
    }

    let destroy = ()=>{
        destroyTag(tag, ()=>{});
    }

    const submit = ()=>{
        form.validateFields((err, tag)=>{
            if (!err){
                saveTag(Object.assign(value, tag))
            }
        })
    }

    return (
        <Form>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                {half(
                    <FormItem
                        label="Select"
                        {...formLayout}
                        >
                        {getFieldDecorator('parent', {
                            initialValue: tag.parent,
                        })(
                            
                            <Select placeholder='No parent' onChange={submit}>
                                {getOptions(parent_list)}
                            </Select>
                        )}
                    </FormItem>
                )}
                {half(
                    <FormItem
                        label="Management of conditions"
                        {...formLayout}
                        >
                        {getFieldDecorator('negate_conditional', {
                            initialValue: tag.negate_conditional,
                        })(
                            <Select onChange={submit}>
                                {getOptions(negate_options)}
                            </Select>
                        )}
                    </FormItem>
                )}
                {twoThird(
                    <FormItem
                        label="Name"
                        {...formLayout}
                        >
                        {getFieldDecorator("name",{
                            rules: [
                                { required: true, message: 'Is required a name' }
                            ],
                            initialValue: tag.name,
                        })(
                            <Input placeholder="Name" type="text" value={tag.name} onBlur={submit}/>
                        )}
                    </FormItem>
                )}
                {oneThird(
                    <FormItem>
                        <Primary style={{width: '100%'}} {...propsButtons} onClick={eventHandler(apply)}>Apply</Primary>
                        <Danger style={{width: '100%'}} {...propsButtons} onClick={eventHandler(destroy)}>Delete</Danger>
                    </FormItem>
                )}
            </Row>
        </Form>
    )
}

const f = Form.create()(FormTag)

export default f;