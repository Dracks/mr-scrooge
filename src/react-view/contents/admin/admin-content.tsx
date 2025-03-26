import React from 'react';
import { Route, Routes } from 'react-router';

import { useUserProfileOrThrows } from '../../utils/session/session-context';
import NotFound from '../extra/not-found';
import { AdminUsers } from './users/admin-user';

export const AdminContent: React.FC = () => {
    const user = useUserProfileOrThrows();
    if (user.isAdmin) {
        return (
            <Routes>
                <Route path="users/*" element={<AdminUsers />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        );
    }
    return <NotFound />;
};
