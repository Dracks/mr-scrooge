import React, { PropsWithChildren, useContext, useMemo } from 'react';
import { useAsync, useAsyncCallback } from 'react-async-hook';

import { useApi } from '../../api/client';
import { ApiUUID, SessionInfo, UserGroup, UserProfile } from '../../api/models';
import { useLogger } from '../logger/logger.context';
import { LoadingPage } from '../ui/loading';

class NotAuthenticatedError extends Error { }

interface SessionContext {
    session: SessionInfo;
    userGroups: Map<ApiUUID, UserGroup>
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
    const client = useApi();
    const session = useAsync(() => client.GET('/session'), [client]);
    const logout = useAsyncCallback(async () => {
        await client.DELETE('/session');
        await session.execute().then(() => {
            logout.reset();
        });
    });
    const logger = useLogger('App');
    const userGroups = useMemo(() => {
        const rest = new Map<ApiUUID, UserGroup>()
        if (session.result){
            const userInfo = session.result.data
            if (userInfo?.user == "identified"){
                userInfo.profile.groups.forEach(group => {
                    rest.set(group.id, group)
                })
            }
        }
        return rest
    }, [session.result]);
    if (session.result && logout.status === 'not-requested') {
        return (
            <SessionContext.Provider
                value={{
                    session: session.result.data as SessionInfo,
                    userGroups,
                    refresh: () => { session.execute() },
                    logout: () => { logout.execute() },
                }}
            >
                {children}
            </SessionContext.Provider>
        );
    }

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
    const {session} = useContext(SessionContext)
    if (session.user === "anonymous"){
        throw new NotAuthenticatedError()
    }
    return session.profile;
}

export const useIsAuthenticated = (): boolean => {
    const info = useContext(SessionContext);
    console.log(info)
    return info.session.user !== 'anonymous';
};

export const useUserGroupsMap = () => useContext(SessionContext).userGroups
