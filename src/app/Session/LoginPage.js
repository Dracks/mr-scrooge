import React from 'react';

import Rest from '../../network/Rest';
import Input from '../../components/Input';
import MessageComponent from '../../components/Message';

import ConstantsCss from '../Constants-CSS';
import {eventHandler} from '../Utils';

const LoginPage = ({history, login}) => {
    var data = {
        user: "",
        password: "",
    };
    var showMessage;
    return (<div className="row">
                <div className="col s6 offset-s3">
                    <MessageComponent register={(c)=>{showMessage=c}}/>
                    <div className="input-field">
                        <Input placeholder="User" value={data.user} onBlur={e=>data.user=e} /> 
                        <Input placeholder="Password" type="password" value={data.password} onBlur={e=>data.password=e} /> 
                    </div>
                    <button onClick={eventHandler(()=>login(data))} className="btn"> 
                        Login 
                    </button>
                </div>
            </div>)
}

export default LoginPage