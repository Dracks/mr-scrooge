import React from 'react'
import { Header, Button, Nav, Menu, Box } from 'grommet'
import { Home, Logout } from 'grommet-icons'

import useSessionContext from './session/context'
import { AnchorLink } from '../utils/ui/anchor-link'


const Headers: React.FC<{}> = () => {
    const userInfo = useSessionContext()

    return (
        <Header background={{color: "nav-background", dark: true}} pad="small">
             <Nav direction='row'>
                <AnchorLink
                    href='/'
                    icon={<Home color="light-1" />}
                    label="Mr Scrooge"
                    color="light-1"
                />
                <AnchorLink
                    href='/tags'
                    label="Tags"
                    color="light-1"
                />
                <AnchorLink
                    href='/import'
                    label='Imports'
                    color='light-1'
                    />
                <AnchorLink
                    href='/movement'
                    label='Movements'
                    color='light-1'
                    />
                <AnchorLink
                    href='/tag'
                    label='Tags'
                    color='light-1'
                    />
            </Nav>
            <Box flex />
            <Menu
                label={userInfo.username}
                items={[
                    {
                        label: userInfo.email
                    },
                    {
                        label: 'logout',
                        icon: <Logout />,
                        onClick: userInfo.logout,
                    },
                ]}
            />
        </Header>
    )
}

export default Headers
