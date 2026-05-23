import React from 'react';
import { useParams } from 'react-router';

import { OAuthClient } from '../../../api/models';
import NotFound from '../../extra/not-found';
import { EditOAuthApp } from './edit-oauth-app';

interface AppSwitcherParams {
    apps: OAuthClient[];
    onDelete: () => void;
}

export const AppSwitcher: React.FC<AppSwitcherParams> = ({ apps, onDelete }) => {
    const { id } = useParams();
    const appDetails = apps.find(app => app.client_id === id);
    return appDetails ? <EditOAuthApp app={appDetails} onDelete={onDelete} /> : <NotFound />;
};
