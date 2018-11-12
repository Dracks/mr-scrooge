import * as React from 'react';
import {Button } from 'antd';

const Primary = (props) =>(
    <Button {...props} type="primary"/>
)

const Normal = (props) => (
    <Button {...props} />
)

const Danger = (props) => (
    <Button {...props} type="danger" />
)

export { Primary, Normal, Danger }