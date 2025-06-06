import createFetchClient from 'openapi-fetch';
import React from 'react';
import { createContext, PropsWithChildren } from 'react';

import type { paths } from './generated-models';

type ApiClient = ReturnType<typeof createFetchClient<paths>>;
const ApiContext = createContext<ApiClient>({} as unknown as ApiClient);

export const ProvideApi: React.FC<PropsWithChildren & { server?: string }> = ({ children, server = '' }) => {
    const $api = React.useMemo(() => {
        return createFetchClient<paths>({
            baseUrl: `${server}/api`,
        });
    }, []);

    return <ApiContext.Provider value={$api}>{children}</ApiContext.Provider>;
};

export const useApiClient = () => React.useContext(ApiContext);
