import { Box, Button, Form, Heading } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { useNavigate } from 'react-router';

import { useApiClient } from '../../../api/client';
import { OAuthScope } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { catchAndLog } from '../../../utils/promises';
import { getOAuthAppFormData, OAuthAppForm, OAuthAppFormData } from './oauth-app-form';

interface RegisterClientBody {
    name: string;
    description?: string;
    redirect_uris: string[];
    scopes: OAuthScope[];
}

export const NewOAuthApp: React.FC<{ reload: () => void }> = ({ reload }) => {
    const logger = useLogger('NewOAuthApp');
    const navigate = useNavigate();
    const client = useApiClient();
    const [appData, setAppData] = React.useState<OAuthAppFormData>(getOAuthAppFormData());

    const createApp = useAsyncCallback(async (formData: OAuthAppFormData) => {
        const body: RegisterClientBody = {
            name: formData.name,
            description: formData.description,
            redirect_uris: formData.redirect_uris,
            scopes: formData.scopes,
        };
        return client.POST('/oauth/clients', { body });
    });

    return (
        <Box>
            <Heading level={2}>Create new OAuth Application</Heading>
            <Form<OAuthAppFormData>
                value={appData}
                onChange={setAppData}
                onSubmit={() => {
                    catchAndLog(
                        createApp.execute(appData).then(async response => {
                            const newApp = response.data;
                            if (newApp) {
                                reload();
                                await navigate(newApp.client_id);
                            }
                        }),
                        'Error creating OAuth app',
                        logger,
                    );
                }}
            >
                <OAuthAppForm value={appData} onChange={setAppData} />
                <Button
                    primary
                    label="Create"
                    type="submit"
                    disabled={!appData.name || !appData.redirect_uris.length || createApp.loading}
                />
            </Form>
        </Box>
    );
};
