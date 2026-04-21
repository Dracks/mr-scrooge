import { Box, Nav, Sidebar, TextInput } from 'grommet';
import React from 'react';
import { Route, Routes } from 'react-router';

import { useApiClient } from '../../../api/client';
import { usePagination } from '../../../api/pagination';
import { useLogger } from '../../../utils/logger/logger.context';
import { AnchorLink } from '../../../utils/ui/anchor-link';
import { AppSwitcher } from './app-switcher';
import { NewOAuthApp } from './new-oauth-app';
import { OAuthAppsList } from './oauth-apps-list';

export const AdminOAuthApps: React.FC = () => {
    const [searchText, setSearchText] = React.useState<string>('');
    const logger = useLogger('AdminOAuthApps');
    const client = useApiClient();
    const paginationApps = usePagination(
        async next => {
            const { data } = await client.GET('/oauth/clients', { params: { query: { cursor: next } } });
            if (data) {
                return data;
            } else {
                logger.error("Request didn't get data");
                throw Error("Get OAuth clients didn't have any data");
            }
        },
        { autostart: true, hash: app => app.client_id },
    );
    const apps = paginationApps.loadedData;

    const filteredApps =
        searchText.length > 0 ? apps.filter(app => app.name.toLowerCase().includes(searchText.toLowerCase())) : apps;

    const handleDelete = React.useCallback(() => {
        paginationApps.reset();
    }, [paginationApps]);

    return (
        <Box direction="row">
            <Sidebar background="neutral-2">
                <Nav>
                    <Box pad="small">
                        <TextInput
                            placeholder="Search apps"
                            value={searchText}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setSearchText(e.target.value);
                            }}
                        />
                    </Box>
                    <Box pad="small">
                        <AnchorLink to="/admin/oauth-apps/">New</AnchorLink>
                    </Box>
                    <OAuthAppsList apps={filteredApps} />
                </Nav>
            </Sidebar>
            <Box fill>
                <Routes>
                    <Route path=":id" element={<AppSwitcher apps={apps} onDelete={handleDelete} />} />
                    <Route
                        path=""
                        element={
                            <NewOAuthApp
                                reload={() => {
                                    paginationApps.reset();
                                }}
                            />
                        }
                    />
                </Routes>
            </Box>
        </Box>
    );
};
