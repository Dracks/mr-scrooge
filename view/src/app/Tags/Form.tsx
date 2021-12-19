import {
    Form,
    Input,
    Row,
    Select
} from 'antd';
import * as React from 'react';

import AntdFormHelper from 'src/utils/AntdForm';
import { Danger, Primary } from '../../components/dessign/buttons'
import { half, oneThird, twoThird } from '../../components/dessign/grid'

import { getOptions } from '../../components/Select';
import {eventHandler} from '../Utils';

import { ITag } from 'src/types/data';

type TagAction = (tag: ITag)=>void;

interface ITagFormProps {
    value: ITag,
    saveTag: TagAction,
    destroyTag: TagAction,
    applyFilters: TagAction,
    hashTags: {[id:string]:ITag},
    tags: ITag[]
}

const formLayout = {
    labelCol: {
        span: 24
    },
    wrapperCol: {
        span: 24
    },
}

const NEGATE_OPTIONS = [
    {key: "false", value: "cond1 or cond2 ..."},
    {key: "true", value: "not cond1 and not cond2 ..."}
]

const FormItem = Form.Item;

const GetTagForm = ({value, saveTag, destroyTag, applyFilters, hashTags, tags})=>({form}) => {
    const { getFieldDecorator } = form;
    const tag = value;
    const propsButtons = tag.id ? {} : {disabled:true};

    const notShownListTags = [];
    if (value.id){
        const listChildren = [value.id];
        while(listChildren.length){
            const first = listChildren.shift()
            notShownListTags.push(first);
            const lookingChildren = hashTags[first]
            if (lookingChildren){
                lookingChildren.children.forEach(e=>{
                    listChildren.push(e);
                });
            }
        }
    }

    const parentList = tags
        .filter(({id})=>notShownListTags.indexOf(id)===-1)
        .map(({id, name})=>({key:id, value:name}));

    const apply = ()=>{
        applyFilters(tag)
    }

    const destroy = ()=>{
        destroyTag(tag);
    }

    const submit = ()=>{
        // FIX-ME: It's a workarround, we tried with onFieldsChanged, 
        // but crash everything
        setTimeout(()=>{
            form.validateFields((err, tag2)=>{
                if (!err){
                    saveTag(Object.assign(value, tag2))
                }
            })
        }, 50);
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
                            onChange: submit,
                        })(

                            <Select>
                                {getOptions([{value:"No parent", key:null}, ...parentList])}
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
                            initialValue: ""+tag.negate_conditional,
                            onChange: submit,
                        })(
                            <Select>
                                {getOptions(NEGATE_OPTIONS)}
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
                            initialValue: tag.name,
                            rules: [
                                { required: true, message: 'Is required a name' }
                            ],
                            
                        })(
                            <Input placeholder="Name" type="text" onBlur={submit}/>
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

const FormHelper = AntdFormHelper()
const FormTag = (props: ITagFormProps)=>(
    <FormHelper>
        {GetTagForm(props)}
    </FormHelper>
)

export default FormTag