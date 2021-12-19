import React from 'react'
import { Footer, Text, Main, Box } from 'grommet'
import { Route, Routes } from 'react-router-dom'

import NotFound from './extra/not-found'
import Headers from './headers'
import { useGetUserInfo } from '../api/client/me/use-get-user-info'
import { UserSessionContext } from './session/context'
import { LoadingPage } from '../utils/ui/loading'
import { useDeleteLogout } from '../api/client/session/use-delete-logout'

interface RestrictedContentArgs {
    reloadSession: ()=>void
}
const RestrictedContent: React.FC<RestrictedContentArgs> = ({reloadSession}) => {
    const [userInfo] = useGetUserInfo()
    const [, logout] = useDeleteLogout()

    if (userInfo.loading){
        return <LoadingPage />
    } else if (userInfo.data){
        return  <UserSessionContext.Provider
                value={{
                    ...userInfo.data,
                    logout: async () => {
                        await logout()
                        reloadSession()
                    },
                }}
            >
            <Headers />
            <Main>
                <Routes>
                    {/*<Route path="/" element={MainPage} /> */}
                    <Route path="*" element={NotFound} />
                </Routes>
            </Main>

            <Footer background="light-2" pad="medium">
                <Box fill align="center">
                    <Text size="xsmall" textAlign="center">
                        Mr Scrooge by Jaume Singla Valls
                    </Text>
                </Box>
            </Footer>
        </UserSessionContext.Provider>
    } else {
        return <div>Error: {userInfo.error?.name}</div>
    }
}

export default RestrictedContent;


