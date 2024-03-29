import { AxiosError } from 'axios';
import React from 'react';

import { UserSession } from './api/client/session/types';
import { useDeleteLogout } from './api/client/session/use-delete-logout';
import { useGetSession } from './api/client/session/use-get-session';
import { usePostLogin } from './api/client/session/use-post-login';
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
    error?: AxiosError | null;
    loading: boolean;
}

const App: React.FC = () => {
    const [sessionRequest, reloadSession] = useGetSession();
    const [loginStatus, loginRequest] = usePostLogin();

    const [sessionStatus, setSession] = React.useState<SessionStatus>({
        loading: sessionRequest.loading,
    });

    const logger = useLogger();
    React.useEffect(() => {
        setSession({
            loading: sessionRequest.loading,
            data: sessionRequest.data,
            error: sessionRequest.error,
        });
    }, [sessionRequest]);

    const login = ({ username, password }: LoginCredentials) => {
        loginRequest({ data: { user: username, password } })
            .then(response => {
                setSession({
                    ...sessionStatus,
                    data: response.data,
                });
            })
            .catch(error => logger.error('Error sending user credentials', { error }));
    };
    const isAuthenticated = sessionStatus.data && sessionStatus.data.isAuthenticated;

    if (sessionStatus.loading && !isAuthenticated) {
        return <LoadingPage />;
    } else if (!sessionStatus.error) {
        if (isAuthenticated) {
            return <IdentifiedPage userData={sessionStatus.data as UserSession} reloadSession={reloadSession} />;
        }
        return (
            <Login
                isLoading={loginStatus.loading}
                login={login}
                error={loginStatus.error}
                invalidCredentials={loginStatus.data ? !loginStatus.data.isAuthenticated : false}
            />
        );
    }
    return <div>Error: {sessionStatus.error?.name}</div>;
};

export default App;
