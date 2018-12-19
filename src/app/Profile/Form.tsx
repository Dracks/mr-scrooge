import { Form, Input, Row } from 'antd';
import * as React from 'react';


import { Centered } from 'src/components/dessign/alignment';
import { Primary } from 'src/components/dessign/buttons';
import { half } from 'src/components/dessign/grid';
import { eventHandler } from '../Utils';

const FormItem = Form.Item

export interface IProfileFormProps {
    username: string
    email: string
}

const ProfileForm = ({profile, save, form})=>{
    const { getFieldDecorator } = form;
    const checkSecondPassword = (rule, value, callback) => {
        if (value && value !== form.getFieldValue('new-password')) {
          callback('Confirm password don\'t match new password');
        } else {
          callback();
        }
      }
    const submit = ()=>{
        form.validateFields((err, data)=>{
            if (!err){
                save(data);
            }
        })
    }
    return (
        <Form>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                {half(<div>
                        <FormItem label="Username">
                            {getFieldDecorator('username', {
                                initialValue: profile.username,
                                required: true,
                            })(
                                <Input
                                placeholder="Username"
                                type="text" />)}
                        </FormItem>
                        <FormItem label="E-Mail">
                            {getFieldDecorator('email', {
                                initialValue: profile.email
                            })(
                                <Input
                                placeholder="E-Mail"
                                type="text" />)}
                        </FormItem>
                    </div>)}
                {half(<div>
                    <FormItem label="Password">
                        {getFieldDecorator('password', {
                            required: true,
                            rules: [{ required: true, message: 'Any change requires your current password!' }],
                        })(
                            <Input
                                placeholder="Password"
                                type="password" />)}
                    </FormItem>
                    <FormItem label="New Password">
                        {getFieldDecorator('new-password', {
                            required: true,
                        })(
                            <Input
                                placeholder="Password"
                                type="password" />)}
                    </FormItem>
                    <FormItem label="Confirm password">
                        {getFieldDecorator('re-password', {
                            required: true,
                            rules: [{validator: checkSecondPassword}],
                        })(
                            <Input
                                placeholder="Password"
                                type="password" />)}
                    </FormItem>
                </div>)}
            </Row>
            <Centered>
                <FormItem>
                    <Primary onClick={eventHandler(submit)}>Save</Primary>
                </FormItem>
            </Centered>
        </Form>
    )
}

export default Form.create()(ProfileForm)