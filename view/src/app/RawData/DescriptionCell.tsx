import React, { ChangeEvent } from 'react';

import { Input } from 'antd';

const { TextArea } = Input;

type SetType = (description:string)=>void
interface IDescriptionCellProps {
    description: string
    set: SetType
}

const getOnChange = (set: SetType)=>
    (event:ChangeEvent<HTMLTextAreaElement>)=>
        set(event.target.value)


const DescriptionCell = (props: IDescriptionCellProps)=>(
    <TextArea style={{width:"100%"}} value={props.description} onBlur={getOnChange(props.set)}/>
)


export default DescriptionCell