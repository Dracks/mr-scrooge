import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApi } from '../../api/client';
import { useLogger } from '../../utils/logger/logger.context';
import { useSession } from '../../utils/session/session-context';
import LoginView, { LoginCredentials } from './login-view';

export const Login: React.FC = () => {
    const logger = useLogger('Login');
    const session = useSession();
    const client = useApi();
    const loginRequest = useAsyncCallback(async (body: LoginCredentials) => {
        const response = await client.POST('/session', { body });
        session.refresh();
        return response;
    });
    logger.info('loginData', { loginRequest });
    if (loginRequest.status == 'error') {
        logger.error('Login request throw an error', loginRequest.error);
    }
    let invalidCredentials = false;
    if (loginRequest.status == 'success' && loginRequest.result?.response.status === 401) {
        invalidCredentials = true;
    }
    return (
        <LoginView
            isLoading={loginRequest.loading}
            invalidCredentials={invalidCredentials}
            login={credentials => {
                loginRequest.execute(credentials);
            }}
        />
    );
};

export default Login;
