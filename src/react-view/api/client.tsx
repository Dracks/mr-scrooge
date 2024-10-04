import createFetchClient from 'openapi-fetch';
import React from 'react';
import { createContext, PropsWithChildren, useMemo } from 'react';

import type { paths } from './generated-models';

const ApiContext = createContext<ReturnType<typeof createFetchClient<paths>>>({} as any);

export const ProvideApi: React.FC<PropsWithChildren> = ({ children }) => {
    const $api = React.useMemo(() => {
        return createFetchClient<paths>({
            baseUrl: '/api',
        });
    }, []);

    return <ApiContext.Provider value={$api}>{children}</ApiContext.Provider>;
};

export const useApi = () => React.useContext(ApiContext);
