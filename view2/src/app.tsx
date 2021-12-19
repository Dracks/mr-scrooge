import React from 'react'

import { LoadingPage } from './utils/ui/loading'

import './api/client/axios'
import { useGetSession } from './api/client/session/use-get-session'
import { usePostLogin } from './api/client/session/use-post-login'
import { AxiosError } from 'axios'
import Login from './contents/session/login'
import RestrictedContent from './contents/restricted-content'

interface SessionStatus {
    loading: boolean
    error?: AxiosError | null
    data?: boolean
}

const App: React.FC<{}> = () => {
    const [sessionRequest, refetch] = useGetSession()
    const [loginStatus, useLogin] = usePostLogin()

    const [sessionStatus, setSession] = React.useState<SessionStatus>({
        loading: sessionRequest.loading,
    })
    React.useEffect(() => {
        setSession({
            loading: sessionRequest.loading,
            data: sessionRequest.data?.isAuthorized,
            error: sessionRequest.error,
        })
    }, [sessionRequest])

    const login = (user: string, password: string) => {
        useLogin({data: { user, password }}).then((response) => {
            setSession({
                ...sessionStatus,
                data: response.data?.isAuthenticated,
            })
        })
    }

    if (sessionStatus.loading){
        return <LoadingPage />
    } else if (!sessionStatus.error) {
        if (sessionStatus.data){
            return <RestrictedContent reloadSession={()=>{refetch()}}/>
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

    //const [, logout] = useLogOutMutation()

    /*
    if (sessionStatus.loading) {
        return <LoadingPage />
    } else {
        if (sessionStatus.data) {
            return (
                <UserSessionContext.Provider
                    value={{
                        ...sessionStatus.data,
                        logout: async () => {
                            await logout()
                            const { data: _data, ...sess } = sessionStatus
                            setSession(sess)
                        },
                    }}
                >
                    <RestrictedContent />
                </UserSessionContext.Provider>
            )
        }
        
    }*/
}

export default App
