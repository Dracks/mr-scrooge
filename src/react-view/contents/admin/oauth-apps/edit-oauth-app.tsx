import { Box, Button, Form, Heading } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApiClient } from '../../../api/client';
import { ApiUUID, OAuthClient, OAuthScope } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { catchAndLog } from '../../../utils/promises';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { OAuthAppForm, OAuthAppFormData } from './oauth-app-form';

interface UpdateClientBody {
    name?: string;
    description?: string;
    redirect_uris?: string[];
    scopes?: OAuthScope[];
}

const getFormDataFromApp = (app: OAuthClient): OAuthAppFormData => ({
    name: app.name,
    description: app.description,
    redirect_uris: app.redirect_uris,
    scopes: app.scopes,
});

export const EditOAuthApp: React.FC<{ app: OAuthClient; onDelete: () => void }> = ({ app, onDelete }) => {
    const logger = useLogger('EditOAuthApp');
    const client = useApiClient();
    const [appData, setAppData] = React.useState<OAuthAppFormData>(getFormDataFromApp(app));

    React.useEffect(() => {
        setAppData(getFormDataFromApp(app));
    }, [app.client_id]);

    const updateApp = useAsyncCallback(async (clientId: ApiUUID, body: UpdateClientBody) => {
        const { data } = await client.PATCH('/oauth/clients/{clientId}', {
            body,
            params: { path: { clientId } },
        });
        return data;
    });

    const deleteApp = useAsyncCallback(async (clientId: ApiUUID) => {
        await client.DELETE('/oauth/clients/{clientId}', {
            params: { path: { clientId } },
        });
        onDelete();
    });

    return (
        <Box>
            <Heading level={2}>Editing OAuth Application</Heading>
            <Form<OAuthAppFormData>
                value={appData}
                onChange={setAppData}
                onSubmit={() => {
                    catchAndLog(
                        updateApp.execute(app.client_id, {
                            name: appData.name,
                            description: appData.description,
                            redirect_uris: appData.redirect_uris,
                            scopes: appData.scopes,
                        }),
                        'Error updating OAuth app',
                        logger,
                    );
                }}
            >
                <OAuthAppForm value={appData} onChange={setAppData} />
                <Box direction="row" gap="small">
                    <Button primary label="Save" type="submit" disabled={updateApp.loading} />
                    <ConfirmationButton
                        label="Delete"
                        color="status-critical"
                        confirmationText={`Delete ${app.name}?`}
                        onConfirm={() => {
                            catchAndLog(deleteApp.execute(app.client_id), 'Error deleting OAuth app', logger);
                        }}
                    />
                </Box>
            </Form>
        </Box>
    );
};
