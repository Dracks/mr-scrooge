import * as React from 'react';
import { connect } from 'react-redux';
import { restChain } from 'redux-api-rest-hocs';


import CenteredLoading from '../components/Loading';
import ProtectedPage from './ProtectedPage';
import SessionActions from './Session/Actions';
import LoginPage from './Session/LoginPage';

import 'antd/dist/antd.css';

const mapStateToPropsLogin = ()=>{
   return {}
}

const actions = {
    login: (data)=>SessionActions.login(data)
}

const LoginPageWithData = connect(mapStateToPropsLogin, actions)(LoginPage) as any;

const App = ({session}) => {
    if (session && session.is_authenticated){
        return <ProtectedPage />
    } else {
        return <LoginPageWithData />
    }
}

const mapStateToProps = ({session})=>{
    return {session};
}

const AppLoading = restChain()
        .setProperty('session')
        .setInitialize('fetchSession')
        .withLoading(CenteredLoading)
        .build(App)


export default connect(mapStateToProps, {fetchSession: SessionActions.fetch})(AppLoading as any) as any;
