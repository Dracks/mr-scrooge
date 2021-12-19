import * as React from 'react';
import { connect } from 'react-redux';
import { restChain } from 'redux-api-rest-hocs';


import CenteredLoading from '../components/network/Loading';
import ProtectedPage from './ProtectedPage';
import SessionActions from './Session/Actions';
import LoginPage from './Session/LoginPage';

import 'antd/dist/antd.css';


const App = ({session, error, login}) => {
    if (session && session.is_authenticated){
        return <ProtectedPage />
    } else {
        return <LoginPage login={login} error={error}/>
    }
}

const AppLoading = restChain()
        .setProperty('session')
        .setInitialize('fetchSession')
        .withLoading(CenteredLoading)
        .build(App)

const mapStateToProps = ({session})=>{
    return {
        error: session && session.error,
        session,
    };
}

const actions = {
    fetchSession: SessionActions.fetch,
    login: (data)=>SessionActions.login(data),
}

export default connect(mapStateToProps, actions)(AppLoading as any) as any;
