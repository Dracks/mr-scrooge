import { Box } from 'grommet';
import { User, UserAdmin } from 'grommet-icons';
import React from 'react';

import { UserProfile } from '../../../api/models';
import { AnchorLink } from '../../../utils/ui/anchor-link';

interface UsersListParams {
    users: UserProfile[];
}

export const UsersList: React.FC<UsersListParams> = ({ users }) => {
    return (
        <>
            {users.map(user => (
                <Box pad="small" key={user.id} direction="row" align="center">
                    {user.isAdmin ? <UserAdmin /> : <User />}
                    <AnchorLink to={user.id} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.username}
                    </AnchorLink>
                </Box>
            ))}
        </>
    );
};
