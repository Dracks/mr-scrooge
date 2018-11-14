import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { restChain } from 'redux-api-rest-hocs';


import CenteredLoading from '../components/Loading';
import ProtectedPage from './ProtectedPage';
import { fetchSession, login } from './Session/Actions';
import LoginPage from './Session/LoginPage';

import 'antd/dist/antd.css';

const mapStateToPropsLogin = ()=>{
   return {}
}

const actions = {
    login: (data)=>{
      return login(data)
    }
}

const LoginPageWithRouter = withRouter(connect(mapStateToPropsLogin, actions)(LoginPage) as any);


const App = ({session}) => {
    if (session && session.is_authenticated){
        return <ProtectedPage />
    } else {
        return <LoginPageWithRouter />
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


export default withRouter(connect(mapStateToProps, {fetchSession})(AppLoading as any) as any);
