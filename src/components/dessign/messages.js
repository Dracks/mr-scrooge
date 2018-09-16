import React from 'react';
import { Alert } from 'antd';

const Warning = (props) =>(
    <Alert
    message={props.title}
    description={props.message}
    type="warning"
    showIcon
  />
)


const Error = (props) =>(
    <Alert
    message={props.title}
    description={props.message}
    type="error"
    showIcon
  />
)
export { Warning, Error }