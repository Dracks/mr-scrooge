import { Box, Header, Menu, Nav } from 'grommet';
import { Home, Logout } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router';

import { AnchorLink } from '../utils/ui/anchor-link';
import useSessionContext from './session/context';

const Headers: React.FC<{}> = () => {
    const { data: userInfo, logout } = useSessionContext();
    const navigate = useNavigate();

    return (
        <Header background={{ color: 'nav-background', dark: true }} pad="small">
            <Nav direction="row">
                <AnchorLink href="/" icon={<Home color="light-1" />} label="Mr Scrooge" color="light-1" />
                <AnchorLink href="/import" label="Imports" color="light-1" />
                <AnchorLink href="/movement" label="Movements" color="light-1" />
                <AnchorLink href="/tag" label="Tags" color="light-1" />
            </Nav>
            <Box flex />
            <Menu
                label={userInfo.username}
                items={[
                    {
                        label: userInfo.firstName ?? userInfo.email,
                        onClick: () => navigate('/profile'),
                    },
                    {
                        label: 'logout',
                        icon: <Logout />,
                        onClick: logout,
                    },
                ]}
            />
        </Header>
    );
};

export default Headers;
