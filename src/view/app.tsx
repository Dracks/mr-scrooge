/* eslint-disable no-underscore-dangle */
import { CombinedError } from '@urql/core';
import React from 'react';
import { UseQueryState } from 'urql';

import { useDeleteLogout } from './api/client/session/use-delete-logout';
import {
    GQLMyProfile,
    GQLMyProfileFragmentFragment,
    useLoginMutation,
    useMyProfileQuery,
} from './api/graphql/generated';
import RestrictedContent from './contents/restricted-content';
import { UserSessionContext } from './contents/session/context';
import Login, { LoginCredentials } from './contents/session/login';
import { useLogger } from './utils/logger/logger.context';
import { LoadingPage } from './utils/ui/loading';

// eslint-disable-next-line import/no-unassigned-import
import './api/client/axios';

interface IdentifiedPageProps {
    reloadSession: () => void | Promise<void>;
    userData: GQLMyProfile;
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
interface SessionStatusAuthenticated {
    data: GQLMyProfile;
    isAuthenticated: true;
    loading: boolean;
}

interface SessionStatusUnauthenticated {
    error?: CombinedError | null;
    isAuthenticated: false;
    loading: boolean;
}
type SessionStatus = SessionStatusAuthenticated | SessionStatusUnauthenticated;

const getSessionData = (
    sessionRequest: UseQueryState<unknown>,
    me?: GQLMyProfileFragmentFragment | { __typename: string },
) => {
    const isAuthenticated = me && (me.__typename === 'MyProfile') === true;
    if (isAuthenticated) {
        return {
            loading: sessionRequest.fetching,
            data: me,
            isAuthenticated: true,
        } as SessionStatusAuthenticated;
    }
    return {
        loading: sessionRequest.fetching,
        error: sessionRequest.error,
        isAuthenticated: false,
    } as SessionStatusUnauthenticated;
};

const App: React.FC = () => {
    const [sessionRequest, reloadSession] = useMyProfileQuery();
    const [loginStatus, loginRequest] = useLoginMutation();

    const [sessionStatus, setSession] = React.useState<SessionStatus>({
        loading: sessionRequest.fetching,
        isAuthenticated: false,
    });

    const logger = useLogger();
    React.useEffect(() => {
        setSession(() => {
            const { me } = sessionRequest.data ?? {};
            return getSessionData(sessionRequest, me);
        });
    }, [sessionRequest]);

    const login = ({ username, password }: LoginCredentials) => {
        loginRequest({ credentials: { username, password } })
            .then(response => {
                setSession(() => {
                    const { login: loginData } = response.data ?? {};
                    return getSessionData(loginStatus, loginData);
                });
            })
            .catch(error => logger.error('Error sending user credentials', { error }));
    };
    const { isAuthenticated } = sessionStatus;

    if (sessionStatus.loading && !isAuthenticated) {
        return <LoadingPage />;
    } else if (isAuthenticated) {
        return <IdentifiedPage userData={sessionStatus.data} reloadSession={reloadSession} />;
    } else if (!sessionStatus.error) {
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
