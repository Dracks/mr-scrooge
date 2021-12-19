import { Form } from "antd";
import * as React from 'react';

const AntdFormHelper = ()=>{
    const ChildForm = (props)=>{
        const Children : React.ComponentType<any> = props.children
        return (<Children {...props}/>)
    }
    
    return Form.create()(ChildForm)
}

export default AntdFormHelper

