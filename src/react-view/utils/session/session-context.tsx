import React, { PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useAsync, useAsyncCallback } from 'react-async-hook';

import { useApi } from '../../api/client';
import { ApiUUID, SessionInfo, UserGroup, UserProfile } from '../../api/models';
import { useLogger } from '../logger/logger.context';
import { catchAndLog } from '../promises';
import { LoadingPage } from '../ui/loading';

class NotAuthenticatedError extends Error {}

interface SessionContext {
    session: SessionInfo;
    userGroups: Map<ApiUUID, UserGroup>;
    refresh: () => void;
    logout: () => void;
}

const SessionContext = React.createContext<SessionContext>({
    session: { user: 'anonymous' },
    userGroups: new Map<ApiUUID, UserGroup>(),
    refresh: () => undefined,
    logout: () => undefined,
});

export const SessionProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [sessionInfo, setSessionInfo] = useState<SessionInfo>();
    const client = useApi();
    const session = useAsync(() => client.GET('/session'), [client]);
    const logout = useAsyncCallback(async () => {
        setSessionInfo(undefined);
        await client.DELETE('/session');
        await session.execute().then(() => {
            logout.reset();
        });
    });
    const logger = useLogger('SessionContext');
    const userGroups = useMemo(() => {
        const rest = new Map<ApiUUID, UserGroup>();
        if (session.result) {
            const userInfo = session.result.data;
            if (userInfo?.user == 'identified') {
                userInfo.profile.groups.forEach(group => {
                    rest.set(group.id, group);
                });
            }
        }
        return rest;
    }, [sessionInfo]);
    useEffect(() => {
        if (session.status === 'success') {
            if (session.result) {
                setSessionInfo(session.result.data);
            } else {
                logger.error('Session could not be retrieved');
                setSessionInfo(undefined);
            }
        }
    }, [session.result]);
    if (sessionInfo) {
        return (
            <SessionContext.Provider
                value={{
                    session: sessionInfo,
                    userGroups,
                    refresh: () => {
                        catchAndLog(session.execute(), 'sessionRefresh', logger);
                    },
                    logout: () => {
                        catchAndLog(logout.execute(), 'Logout', logger);
                    },
                }}
            >
                {children}
            </SessionContext.Provider>
        );
    }
    logger.info('What the fuck!', session.result);

    if (session.loading || logout.status === 'loading') {
        return <LoadingPage />;
    }

    logger.error('Session Query error', { error: session.error });
    return <div>Error: {session.error && session.error.message}</div>;
};

export const useSession = (): SessionContext => {
    return useContext(SessionContext);
};

export const useUserProfileOrThrows = (): UserProfile => {
    const { session } = useContext(SessionContext);
    if (session.user === 'anonymous') {
        throw new NotAuthenticatedError();
    }
    return session.profile;
};

export const useIsAuthenticated = (): boolean => {
    const info = useContext(SessionContext);
    console.log(info);
    return info.session.user !== 'anonymous';
};

export const useUserGroupsMap = () => useContext(SessionContext).userGroups;
