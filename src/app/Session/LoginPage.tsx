import * as React from 'react';

import { Form, Icon, Input, Button, Row, Col } from 'antd';

import {eventHandler} from '../Utils';

const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
  handleSubmit = eventHandler((e) => {
    this.props.form.validateFields((err, values) => {
        if (!err) {
            this.props.login(values);
        }
    });
  })

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
        <Row type="flex" justify="center" align="middle">
            <Col  xs={20} sm={16} md={12} lg={10} xl={8} >
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
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        Log in
                    </Button>
                    </FormItem>
                </Form>
            </Col>
      </Row>
    );
  }
}

const LoginPage = Form.create()(NormalLoginForm);

export default LoginPage