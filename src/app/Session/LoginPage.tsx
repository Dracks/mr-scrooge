import * as React from 'react';

import { Col, Form, Icon, Input, Row } from 'antd';

import { Primary } from 'src/components/dessign/buttons';
import { Error } from 'src/components/dessign/messages';
import {eventHandler} from '../Utils';

const FormItem = Form.Item;

class NormalLoginForm extends React.Component<any> {
  public handleSubmit = eventHandler((e) => {
    this.props.form.validateFields((err, values) => {
        if (!err) {
            this.props.login(values);
        }
    });
  })

  public render() {
    const props = this.props;
    const { getFieldDecorator } = props.form;
    const error = props.error && <Error title={props.error.code} message={props.error.description} /> || <div/>
    return (
        <Row type="flex" justify="center" align="middle">
            <Col  xs={20} sm={16} md={12} lg={10} xl={8} >
                {error}
                <Form onSubmit={this.handleSubmit} className="login-form">
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
}

const LoginPage = Form.create()(NormalLoginForm);

export default LoginPage