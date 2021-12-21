import React from 'react'

import { LoadingPage } from './utils/ui/loading'

import './api/client/axios'
import { useGetSession } from './api/client/session/use-get-session'
import { usePostLogin } from './api/client/session/use-post-login'
import { AxiosError } from 'axios'
import Login from './contents/session/login'
import RestrictedContent from './contents/restricted-content'
import { UserSession } from './api/client/session/types'
import { UserSessionContext } from './contents/session/context'
import { useDeleteLogout } from './api/client/session/use-delete-logout'

interface SessionStatus {
    loading: boolean
    error?: AxiosError | null
    data?: Partial<UserSession>
}

const App: React.FC<{}> = () => {
    const [sessionRequest, reloadSession] = useGetSession()
    const [loginStatus, useLogin] = usePostLogin()
    const [, logout] = useDeleteLogout()

    const [sessionStatus, setSession] = React.useState<SessionStatus>({
        loading: sessionRequest.loading,
    })
    React.useEffect(() => {
        console.log(sessionRequest.data)

        setSession({
            loading: sessionRequest.loading,
            data: sessionRequest.data,
            error: sessionRequest.error,
        })
    }, [sessionRequest])

    const login = (user: string, password: string) => {
        useLogin({data: { user, password }}).then((response) => {
            setSession({
                ...sessionStatus,
                data: response.data,
            })
        })
    }

    if (sessionStatus.loading){
        return <LoadingPage />
    } else if (!sessionStatus.error) {
        if (sessionStatus.data && sessionStatus.data.isAuthenticated){
            return <UserSessionContext.Provider
                value={{
                    ...(sessionStatus.data as UserSession),
                    logout: async () => {
                        await logout()
                        reloadSession()
                    },
                }}
            >
                <RestrictedContent/>
            </UserSessionContext.Provider>
        } else {
            return <Login
                    isLoading={loginStatus.loading}
                    login={login}
                    error={loginStatus.error}
                />
        }
    } else {
        return <div>Error: {sessionStatus.error?.name}</div>
    }
}

export default App
