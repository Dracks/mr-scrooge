import React, { PropsWithChildren, useContext } from 'react';
import { useAsync, useAsyncCallback } from 'react-async-hook';

import { useApi } from '../../api/client';
import { SessionInfo } from '../../api/models';
import { useLogger } from '../logger/logger.context';
import { LoadingPage } from '../ui/loading';

interface SessionContext {
    session: SessionInfo;
    refresh: () => void;
    logout: () => void;
}

const SessionContext = React.createContext<SessionContext>({
    session: { user: 'anonymous' },
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
    if (session.result && logout.status === 'not-requested') {
        return (
            <SessionContext.Provider
                value={{
                    session: session.result.data as SessionInfo,
                    refresh: () => session.execute(),
                    logout: () => logout.execute(),
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

export const useIsAuthenticated = (): boolean => {
    const info = useContext(SessionContext);
    console.log(info)
    return info.session.user !== 'anonymous';
};
