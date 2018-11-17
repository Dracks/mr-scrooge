import { Alert } from 'antd';
import * as React from 'react';

const Warning = (props) =>(
    <Alert
    message={props.title}
    description={props.message}
    type="warning"
    showIcon={true}
  />
)


const Error = (props) =>(
    <Alert
    message={props.title}
    description={props.message}
    type="error"
    showIcon={true}
  />
)
export { Warning, Error }