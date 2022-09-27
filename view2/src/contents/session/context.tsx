import React from 'react';

import { UserSession } from '../../api/client/session/types';

export interface UserSessionCtx {
    data: UserSession;
    logout: () => Promise<void>;
    reload: () => Promise<void>;
}

export class NotUserSetException extends Error {
    constructor() {
        super('Not user set in the context, you cannot use it without setting it before');
    }
}

export const UserSessionContext = React.createContext<UserSessionCtx | undefined>(undefined);

const useSessionContext = (): UserSessionCtx => {
    const user = React.useContext(UserSessionContext);

    if (!user) {
        throw new NotUserSetException();
    }
    return user;
};

export default useSessionContext;
