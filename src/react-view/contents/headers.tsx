import { Box, Header, Menu, Nav } from 'grommet';
import { Edit, Group, Home, Logout, User, UserAdmin } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router';

import { useSession } from '../utils/session/session-context';
import { AnchorLink } from '../utils/ui/anchor-link';

const Headers: React.FC = () => {
    const { session, logout } = useSession();
    if (session.user === 'anonymous') {
        throw Error('User should not be anonymous');
    }
    const userInfo = session.profile;
    const navigate = useNavigate();

    const adminSection = userInfo.isAdmin ? (
        <Menu
            label={
                <Box>
                    <UserAdmin /> Admin
                </Box>
            }
            items={[
                {
                    label: <Box>Users</Box>,
                    onClick: () => {
                        navigate('/admin/users');
                    },
                    icon: <User />,
                },
                {
                    label: <Box>Groups</Box>,
                    onClick: () => {
                        navigate('/admin/groups');
                    },
                    icon: <Group />,
                },
            ]}
        />
    ) : undefined;

    return (
        <Header background={{ color: 'nav-background', dark: true }} pad="small">
            <Nav direction="row">
                <AnchorLink href="/" icon={<Home color="light-1" />} label="Mr Scrooge" color="light-1" />
                <AnchorLink href="/import" label="Imports" color="light-1" />
                <AnchorLink href="/movement" label="Movements" color="light-1" />
                <AnchorLink href="/label" label="Labels" color="light-1" />
                <AnchorLink href="/rule" label="Rules" color="light-1" />
            </Nav>
            <Box flex />
            {adminSection}
            <Menu
                label={userInfo.username}
                items={[
                    {
                        label: userInfo.firstName ?? userInfo.email,
                        onClick: () => {
                            navigate('/profile');
                        },
                        icon: <Edit />,
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
