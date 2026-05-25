import { Box, Button, Form, Heading, Text } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApiClient } from '../../../api/client';
import { ApiUUID, OAuthClient, OAuthScope } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { catchAndLog } from '../../../utils/promises';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { WrapperApiError } from '../../../utils/ui/errors/api-error-response';
import { SmallErrorBox } from '../../../utils/ui/errors/small-error-box';
import { OAuthAppForm, OAuthAppFormData, validateAppForm } from './oauth-app-form';

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
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

    React.useEffect(() => {
        setAppData(getFormDataFromApp(app));
    }, [app.client_id]);

    const updateApp = useAsyncCallback(async (clientId: ApiUUID, body: UpdateClientBody) => {
        const result = await client.PATCH('/oauth/clients/{clientId}', {
            body,
            params: { path: { clientId } },
        });
        if (result.error) {
            throw new WrapperApiError(result.error);
        }
        return result.data;
    });

    const deleteApp = useAsyncCallback(async (clientId: ApiUUID) => {
        await client.DELETE('/oauth/clients/{clientId}', {
            params: { path: { clientId } },
        });
        onDelete();
    });

    const handleSubmit = async () => {
        setFieldErrors({});
        const errors = validateAppForm(appData);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        await updateApp.execute(app.client_id, {
            name: appData.name,
            description: appData.description,
            redirect_uris: appData.redirect_uris,
            scopes: appData.scopes,
        });
    };

    return (
        <Box>
            <Heading level={2}>Editing OAuth Application</Heading>
            <Box pad={{ bottom: 'small', left: 'small' }}>
                <Text>Client ID</Text>
                <Text weight="bold"> {app.client_id}</Text>
            </Box>
            <Form<OAuthAppFormData>
                value={appData}
                onChange={newValue => {
                    setFieldErrors({});
                    setAppData(newValue);
                }}
                onSubmit={() => {
                    catchAndLog(handleSubmit(), 'Error updating OAuth app', logger);
                }}
            >
                <OAuthAppForm value={appData} onChange={setAppData} errors={fieldErrors} />
                {updateApp.error && <SmallErrorBox error={updateApp.error} />}
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
