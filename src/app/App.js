import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import WithLoading from '../network/LoadingHoc';

import CenteredLoading from '../components/Loading';
import LoginPage from './Session/LoginPage';
import ProtectedPage from './ProtectedPage';
import { fetchSession, login } from './Session/Actions';

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
    console.log(session);
    if (session && session.is_authenticated){
        return <ProtectedPage />
    } else {
        return <LoginPageWithRouter />
    }
}

const mapStateToProps = ({session})=>{
    return {session};
}

const AppLoading = WithLoading(App, CenteredLoading, 'session', 'fetchSession')


export default withRouter(connect(mapStateToProps, {fetchSession})(AppLoading));