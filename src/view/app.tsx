import { CombinedError } from '@urql/core';
import { AxiosError } from 'axios';
import React from 'react';

import { UserSession } from './api/client/session/types';
import { useDeleteLogout } from './api/client/session/use-delete-logout';
import { useLoginMutation, useMyProfileQuery } from './api/graphql/generated';
import RestrictedContent from './contents/restricted-content';
import { UserSessionContext } from './contents/session/context';
import Login, { LoginCredentials } from './contents/session/login';
import { useLogger } from './utils/logger/logger.context';
import { LoadingPage } from './utils/ui/loading';

// eslint-disable-next-line import/no-unassigned-import
import './api/client/axios';

interface IdentifiedPageProps {
    reloadSession: () => void;
    userData: UserSession;
}

const IdentifiedPage: React.FC<IdentifiedPageProps> = ({ userData, reloadSession }) => {
    const [, logout] = useDeleteLogout();
    return (
        <UserSessionContext.Provider
            value={{
                data: userData,
                logout: async () => {
                    await logout();
                    await reloadSession();
                },
                reload: async () => {
                    await reloadSession();
                },
            }}
        >
            <RestrictedContent />
        </UserSessionContext.Provider>
    );
};

interface SessionStatus {
    data?: Partial<UserSession>;
    error?: CombinedError | null;
    isAuthenticated?: boolean;
    loading: boolean;
}

const App: React.FC = () => {
    const [sessionRequest, reloadSession] = useMyProfileQuery();
    const [loginStatus, loginRequest] = useLoginMutation();

    const [sessionStatus, setSession] = React.useState<SessionStatus>({
        loading: sessionRequest.fetching,
    });

    const logger = useLogger();
    React.useEffect(() => {
        setSession(() => {
            const { me } = sessionRequest.data ?? {};
            const isAuthenticated = me && me.__typename === 'MyProfile';
            return {
                loading: sessionRequest.fetching,
                data: isAuthenticated ? me : undefined,
                error: sessionRequest.error,
                isAuthenticated,
            };
        });
    }, [sessionRequest]);

    const login = ({ username, password }: LoginCredentials) => {
        loginRequest({ credentials: { username, password } })
            .then(response => {
                setSession(() => {
                    const { login } = loginStatus.data ?? {};
                    const isAuthenticated = login && login.__typename === 'MyProfile';
                    return {
                        ...sessionStatus,
                        data: isAuthenticated ? login : undefined,
                        isAuthenticated,
                    };
                });
            })
            .catch(error => logger.error('Error sending user credentials', { error }));
    };
    const { isAuthenticated } = sessionStatus;

    if (sessionStatus.loading && !isAuthenticated) {
        return <LoadingPage />;
    } else if (!sessionStatus.error) {
        if (isAuthenticated) {
            return <IdentifiedPage userData={sessionStatus.data as UserSession} reloadSession={reloadSession} />;
        }
        return (
            <Login
                isLoading={loginStatus.fetching}
                login={login}
                error={loginStatus.error}
                invalidCredentials={
                    loginStatus.data ? loginStatus.data.login.__typename === 'InvalidCredentials' : false
                }
            />
        );
    }
    return <div>Error: {sessionStatus.error?.name}</div>;
};

export default App;
