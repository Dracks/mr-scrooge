import { Box, Header, Menu, Nav } from 'grommet';
import { Edit, Group, Home, Logout, User, UserAdmin } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router';

import { useLogger } from '../utils/logger/logger.context';
import { catchAndLog } from '../utils/promises';
import { useSession } from '../utils/session/session-context';
import { AnchorLink } from '../utils/ui/anchor-link';

const Headers: React.FC = () => {
    const { session, logout } = useSession();
    const logger = useLogger('Headers');
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
                        catchAndLog(Promise.resolve(navigate('/admin/users')), 'Navigate to admin users', logger);
                    },
                    icon: <User />,
                },
                {
                    label: <Box>Groups</Box>,
                    onClick: () => {
                        catchAndLog(Promise.resolve(navigate('/admin/groups')), 'Navigate to admin groups', logger);
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
                            catchAndLog(Promise.resolve(navigate('/profile')), 'navigate to profile', logger);
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
