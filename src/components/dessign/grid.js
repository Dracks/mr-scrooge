import React from 'react';
import { Col } from 'antd';


const getCol = (span) => (children, props) => (
    <Col {...span} {...props}>
        {children}
    </Col>
)

const little = {xs: 24, sm: 24, md: 12}
export const half = getCol({ ...little, lg: 12, xl: 12})

export const oneThird = getCol({ ...little, lg: 8, xl: 8})

export const twoThird = getCol({ ...little, lg: 16, xl: 16 })