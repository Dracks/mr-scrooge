import { Col, Row } from 'antd';
import * as React from 'react';


export const Centered = ({span=4, children})=>(
    <Row type="flex" justify="center" align="middle" >
        <Col span={span}>
            {children}
        </Col>
    </Row>
)

