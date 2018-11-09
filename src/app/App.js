import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { withLoading } from 'redux-api-rest-hocs';

import CenteredLoading from '../components/Loading';
import LoginPage from './Session/LoginPage';
import ProtectedPage from './ProtectedPage';
import { fetchSession, login } from './Session/Actions';
import 'antd/dist/antd.css';

const mapStateToPropsLogin = ()=>{
    return {}
}

const actions = {
    login: (data)=>{
        return login(data)
    }
}

const LoginPageWithRouter = withRouter(connect(mapStateToPropsLogin, actions)(LoginPage));


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

const AppLoading = withLoading(App, CenteredLoading, 'session', 'fetchSession')


export default withRouter(connect(mapStateToProps, {fetchSession})(AppLoading));