import { Box, Button, Heading, Text } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { useSearchParams } from 'react-router';

import { useApiClient } from '../../api/client';
import { OAuthAuthorizationRequest, OAuthClient, OAuthScope } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { catchAndLog } from '../../utils/promises';
import { LoadingPage } from '../../utils/ui/loading';

const SCOPE_INFO: Record<OAuthScope, string> = {
    uploadFile: 'Upload file into the importer',
    userInfo: 'Get information about the current user',
};

interface ValidationError {
    message: string;
    field?: string;
}

const useOAuthAuthorizationRequest = (): Record<keyof OAuthAuthorizationRequest, string | null | undefined> => {
    const [request] = useSearchParams();
    return {
        redirect_uri: request.get('redirect_uri'),
        response_type: request.get('response_type'),
        client_id: request.get('client_id'),
        scope: request.get('scope'),
        state: request.get('state'),
    };
};

const validateRequest = (
    request: Record<keyof OAuthAuthorizationRequest, string | null | undefined>,
    client: OAuthClient,
): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!request.client_id) {
        errors.push({ message: 'Missing client_id parameter', field: 'client_id' });
    }

    if (!request.redirect_uri) {
        errors.push({ message: 'Missing redirect_uri parameter', field: 'redirect_uri' });
    } else if (!client.redirect_uris.includes(request.redirect_uri)) {
        errors.push({
            message: `Invalid redirect_uri. Must be one of: ${client.redirect_uris.join(', ')}`,
            field: 'redirect_uri',
        });
    }

    if (!request.response_type || request.response_type !== 'code') {
        errors.push({ message: "Invalid response_type. Must be 'code'", field: 'response_type' });
    }

    if (request.scope) {
        const requestedScopes = request.scope
            .split(' ')
            .map(s => s as OAuthScope)
            .filter(Boolean);
        const invalidScopes = requestedScopes.filter(s => !client.scopes.includes(s));
        if (invalidScopes.length > 0) {
            errors.push({
                message: `Invalid scope(s): ${invalidScopes.join(', ')}. Allowed: ${client.scopes.join(', ')}`,
                field: 'scope',
            });
        }
    }

    return errors;
};

const ErrorBox: React.FC<{ errors: ValidationError[] }> = ({ errors }) => {
    if (errors.length === 0) return null;

    return (
        <Box pad="medium" background="status-critical" round>
            <Heading level="4" color="white">
                Authorization Error
            </Heading>
            {errors.map((error, index) => (
                <Text key={index} color="white">
                    {error.message}
                </Text>
            ))}
        </Box>
    );
};

const OAuthConfirmation: React.FC<{ appInfo: OAuthClient; scopes: OAuthScope[]; accept: () => void }> = ({
    appInfo,
    scopes,
    accept,
}) => {
    return (
        <Box fill align="center" justify="center" pad="large">
            <Box width="medium" pad="large" border={{ color: 'brand', size: 'large' }} round>
                <Heading level="2" textAlign="center">
                    Authorize {appInfo.name}
                </Heading>
                {appInfo.description && (
                    <Box pad="small">
                        <Text>{appInfo.description}</Text>
                    </Box>
                )}
                <Box pad="medium">
                    <Text weight="bold">This application will have access to:</Text>
                    <ul>
                        {scopes.map(oauthScope => (
                            <li key={oauthScope}>{SCOPE_INFO[oauthScope]}</li>
                        ))}
                    </ul>
                </Box>
                <Button onClick={accept} primary label="Authorize" />
            </Box>
        </Box>
    );
};

const ClientNotFoundError: React.FC<{ message: string }> = ({ message }) => {
    return (
        <Box fill align="center" justify="center" pad="large">
            <Box pad="large" background="status-critical" round>
                <Heading level="2" color="white">
                    Error
                </Heading>
                <Text color="white">{message}</Text>
            </Box>
        </Box>
    );
};

export const OAuthAuthorization: React.FC = () => {
    const logger = useLogger();
    const api = useApiClient();
    const request = useOAuthAuthorizationRequest();

    const [client, setClient] = React.useState<OAuthClient | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchClient = async () => {
            if (!request.client_id) {
                setError('Missing client_id parameter');
                setLoading(false);
                return;
            }

            try {
                const response = await api.GET('/oauth/clients/{clientId}', {
                    params: { path: { clientId: request.client_id } },
                });

                if (response.data) {
                    setClient(response.data);
                } else {
                    setError('Client not found');
                }
            } catch {
                setError('Client not found');
            } finally {
                setLoading(false);
            }
        };

        fetchClient();
    }, [request.client_id]);

    const authorize = useAsyncCallback(async authRequest => {
        const response = await api.GET('/oauth/authorize', {
            params: { query: authRequest },
        });
        logger.info(`Authorization response: ${response.response.status}`);
        if (response.data) {
            const { authorization_code, state } = response.data;
            window.location.replace(
                `${authRequest.redirect_uri}?authorization_code=${authorization_code}&state=${state ?? ''}`,
            );
        }
    });

    const handleAccept = () => {
        catchAndLog(authorize.execute(request), 'Error during authorization', logger);
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <ClientNotFoundError message={error} />;
    }

    if (!client) {
        return <ClientNotFoundError message="Client not found" />;
    }

    const validationErrors = validateRequest(request, client);

    if (validationErrors.length > 0) {
        return (
            <Box fill align="center" justify="center" pad="large">
                <ErrorBox errors={validationErrors} />
            </Box>
        );
    }

    const requestedScopes =
        request.scope
            ?.split(' ')
            .map(scope => scope as OAuthScope)
            .filter(Boolean) ?? client.scopes;

    return <OAuthConfirmation appInfo={client} scopes={requestedScopes} accept={handleAccept} />;
};
