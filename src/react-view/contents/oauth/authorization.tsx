import { Box, Button, Heading, Text } from 'grommet';
import React from 'react';
import { useAsync, useAsyncCallback } from 'react-async-hook';
import { useSearchParams } from 'react-router';
import { z } from 'zod';

import { useApiClient } from '../../api/client';
import { OAuthAuthorizationRequest, OAuthClient, OAuthScope } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { catchAndLog } from '../../utils/promises';
import { ErrorBox, ValidationErrorsBox } from '../../utils/ui/errors';
import { LoadingPage } from '../../utils/ui/loading';

const SCOPE_INFO: Record<OAuthScope, string> = {
    uploadFile: 'Upload file into the importer',
    userInfo: 'Get information about the current user',
};

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
): [undefined, z.ZodError] | [OAuthAuthorizationRequest, undefined] => {
    const schema = z.object({
        client_id: z.string(),
        redirect_uri: z.enum(client.redirect_uris),
        response_type: z.literal('code'),
        scope: z
            .string()
            .optional()
            .nullable()
            .transform(value => value ?? undefined)
            .refine(
                value =>
                    value === undefined ||
                    value
                        .split(' ')
                        .filter(Boolean)
                        .every(scope => client.scopes.includes(scope as OAuthScope)),
                { message: 'Invalid scope requested' },
            ),
        state: z
            .string()
            .optional()
            .nullable()
            .transform(value => value ?? undefined),
    });

    try {
        return [schema.parse(request), undefined];
    } catch (error) {
        if (typeof error === 'object' && error instanceof z.ZodError) {
            return [undefined, error];
        }
        throw error;
    }
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

export const OAuthAuthorization: React.FC = () => {
    const logger = useLogger();
    const api = useApiClient();
    const request = useOAuthAuthorizationRequest();
    const clientInfo = useAsync(async () => {
        const { client_id: clientId } = request;
        if (!clientId) {
            throw new Error('Client Id is mandatory');
        }
        return await api.GET('/oauth/clients/{clientId}', {
            params: { path: { clientId } },
        });
    }, [request.client_id]);

    const authorize = useAsyncCallback(async (authRequest: OAuthAuthorizationRequest) => {
        const response = await api.GET('/oauth/authorize', {
            params: { query: { request: authRequest } },
        });
        logger.info(`Authorization response: ${String(response.response.status)}`);
        if (response.data) {
            const { authorization_code, state } = response.data;
            window.location.replace(
                `${authRequest.redirect_uri}?authorization_code=${authorization_code}&state=${state ?? ''}`,
            );
        }
    });

    if (clientInfo.loading) {
        return <LoadingPage />;
    }

    if (clientInfo.error) {
        return <ErrorBox title="Client info invalid" error={clientInfo.error} />;
    }

    const client = clientInfo.result?.data;

    if (!client) {
        return <ErrorBox title="Client not found" error="Client not found" />;
    }

    const [oauthRequest, validationErrors] = validateRequest(request, client);

    if (validationErrors) {
        return (
            <Box fill align="center" justify="center" pad="large">
                <ValidationErrorsBox title="Invalid client request" errors={validationErrors} />
            </Box>
        );
    }

    const handleAccept = () => {
        catchAndLog(authorize.execute(oauthRequest), 'Error during authorization', logger);
    };

    const requestedScopes =
        request.scope
            ?.split(' ')
            .map(scope => scope as OAuthScope)
            .filter(Boolean) ?? client.scopes;

    return <OAuthConfirmation appInfo={client} scopes={requestedScopes} accept={handleAccept} />;
};
