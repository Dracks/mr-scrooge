import React from 'react'

export interface UserSession {
    email: string
    user: string
    firstName?: string
    lastName?: string
    logout: () => Promise<void>
}

export class NotUserSetException extends Error {
    constructor() {
        super(
            'Not user set in the context, you cannot use it without setting it before'
        )
    }
}

export const UserSessionContext = React.createContext<UserSession | undefined>(
    undefined
)

const useSessionContext = (): UserSession => {
    const user = React.useContext(UserSessionContext)

    if (!user) {
        throw new NotUserSetException()
    }
    return user
}

export default useSessionContext
