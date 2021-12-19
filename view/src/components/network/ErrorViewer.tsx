import React from 'react';

import {IErrorProps} from 'redux-api-rest-hocs';
import { Error } from '../dessign/messages';

const ErrorViewer = (props: IErrorProps)=>{
    const contents = (<div>
            <div>{props.url}</div>
            {props.error.description}
        </div>)
    return (<Error
                title = {props.error.code}
                message= {contents}
                />)
}

export default ErrorViewer