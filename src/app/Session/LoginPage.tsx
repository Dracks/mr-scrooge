import * as React from 'react';

import { Col, Form, Icon, Input, Row } from 'antd';

import { Primary } from 'src/components/dessign/buttons';
import { Error } from 'src/components/dessign/messages';
import AntdFormHelper from 'src/utils/AntdForm';
import { eventHandler } from '../Utils';

type LoginAction = (params:{user:string, password:string})=>void
interface ILoginProps {
    login: LoginAction
    error: any
}

const FormItem = Form.Item;

const GetLoginForm = (login: LoginAction, error: any) => ({form})=>{
    const handleSubmit = React.useCallback(eventHandler(()=>{

        form.validateFields((err, values) => {
            if (!err) {
                // tslint:disable-next-line:no-console
                console.log("Login with "+values);
                login(values);
            }
        })
    }), [form])
    const { getFieldDecorator } = form;
    const errorComponent = error && <Error title={error.code} message={error.description} /> || <div/>
    return (
        <Row type="flex" justify="center" align="middle">
            <Col  xs={20} sm={16} md={12} lg={10} xl={8} >
                {errorComponent}
                <Form onSubmit={handleSubmit} className="login-form">
                    <FormItem>
                    {getFieldDecorator('user', {
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
                    )}
                    </FormItem>
                    <FormItem>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!' }],
                    })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                    )}
                    </FormItem>
                    <FormItem>
                    <Primary htmlType="submit" className="login-form-button">
                        Log in
                    </Primary>
                    </FormItem>
                </Form>
            </Col>
      </Row>
    );
}

const FormHelper = AntdFormHelper();
const LoginPage = ({login, error}: ILoginProps)=>(
    <FormHelper>
        {GetLoginForm(login, error)}
    </FormHelper>
)

export default LoginPage