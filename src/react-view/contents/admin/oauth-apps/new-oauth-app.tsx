import { Box, Button, Form, Heading } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { useNavigate } from 'react-router';

import { useApiClient } from '../../../api/client';
import { OAuthClientWithSecret, OAuthScope } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { catchAndLog } from '../../../utils/promises';
import { WrapperApiError } from '../../../utils/ui/errors/api-error-response';
import { SmallErrorBox } from '../../../utils/ui/errors/small-error-box';
import { CreatedAppPopup } from './created-app-popup';
import { getOAuthAppFormData, OAuthAppForm, OAuthAppFormData, validateAppForm } from './oauth-app-form';

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
    const [createdApp, setCreatedApp] = React.useState<OAuthClientWithSecret | null>(null);
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

    const createApp = useAsyncCallback(async (formData: OAuthAppFormData) => {
        const body: RegisterClientBody = {
            name: formData.name,
            description: formData.description,
            redirect_uris: formData.redirect_uris,
            scopes: formData.scopes,
        };
        const response = await client.POST('/oauth/clients', { body });
        if (response.error) {
            throw new WrapperApiError(response.error);
        }
        return response;
    });

    const handleContinue = () => {
        if (createdApp) {
            reload();
            void navigate(createdApp.client_id);
        }
    };

    const handleSubmit = async () => {
        setFieldErrors({});
        const errors = validateAppForm(appData);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        const response = await createApp.execute(appData);
        setCreatedApp(response.data);
    };

    return (
        <Box>
            <Heading level={2}>Create new OAuth Application</Heading>
            <Form<OAuthAppFormData>
                value={appData}
                onChange={newValue => {
                    setFieldErrors({});
                    setAppData(newValue);
                }}
                onSubmit={() => {
                    catchAndLog(handleSubmit(), 'Error creating OAuth app', logger);
                }}
            >
                <OAuthAppForm value={appData} onChange={setAppData} errors={fieldErrors} />
                {createApp.error && <SmallErrorBox error={createApp.error} />}
                <Button primary label="Create" type="submit" disabled={createApp.loading} />
            </Form>
            {createdApp && <CreatedAppPopup app={createdApp} onContinue={handleContinue} />}
        </Box>
    );
};
