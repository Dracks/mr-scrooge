import React from 'react'
import { Header, Button, Nav, Menu, Box } from 'grommet'
import { Home, Logout } from 'grommet-icons'

import useSessionContext from './session/context'

const Headers: React.FC<{}> = () => {
    const userInfo = useSessionContext()

    return (
        <Header background="neutral-2">
            <Button hoverIndicator>
                <Home /> Mr Scrooge
            </Button>
            <Box flex />
            <Menu
                label={userInfo.email}
                items={[
                    {
                        label: 'logout',
                        icon: <Logout />,
                        onClick: userInfo.logout,
                    },
                ]}
            />
            <Nav direction="row"></Nav>
        </Header>
    )
}

export default Headers
