import React from "react"
import { useParams, useSearchParams } from "react-router"
import { useApiClient } from "../../api/client"
import { OAuthAuthorizationRequest, OAuthClient, OAuthScope } from "../../api/models"
import { useAsync, useAsyncCallback } from "react-async-hook"
import { LoadingPage } from "../../utils/ui/loading"
import { Box, Button, Heading } from "grommet"
import { Logger } from "../../utils/logger/logger.class"
import { useLogger } from "../../utils/logger/logger.context"

const SCOPE_INFO: Record<OAuthScope, string> = {
    "uploadFile": "Upload file into the importer",
    "userInfo": "Get information about the current user",
}

const useOAuthAuthorizationRequest = (): Record<keyof OAuthAuthorizationRequest, string | null | undefined> => {
    const [request] = useSearchParams()
    return {
        redirect_uri: request.get("redirect_uri"),
        response_type: request.get("response_type"),
        client_id: request.get("client_id"),
        scope: request.get("scope"),
        state: request.get("state"),
    }
}

const OAuthConfirmation: React.FC<{ appInfo: OAuthClient, scopes: OAuthScope[], accept: () => void }> = ({ appInfo, scopes, accept }) => {
    return (
        <Box fill align="center" justify="center">
            <Heading level="2">Authorizing {appInfo.name}</Heading>
            <Box>
                This application will have access to:
                <ul>{scopes.map(oauthScope => <li>{SCOPE_INFO[oauthScope]}</li>)}
                </ul>
            </Box>
            <Box>{appInfo.description}</Box>
                <Button onClick={accept}>
                    Authorize
                </Button>
        </Box>
    )
}

export const OAuthAuthorization: React.FC = () => {
    const logger = useLogger()
    const api = useApiClient()
    const request = useOAuthAuthorizationRequest()
    console.log(request)

    const clientInfo = useAsync(async () =>
        api.GET('/oauth/clients/{clientId}', {
            params: { path: { clientId: request.client_id ?? "" } }
        },), [request.client_id]);
    const authorize = useAsyncCallback(async (request) => {
        const response = await api.GET("/oauth/authorize", {
            params: {
                query: 
                    request
                
            },
        })
        logger.info(`Authorization response: ${response.response.status}`)
        if (response.data) {
            const { authorization_code, state } = response.data
            window.location.replace(`${request.redirect_uri}?authorization_code=${authorization_code}&state=${state}`);
        }
    })

    if (clientInfo.loading) {
        return <LoadingPage />
    } else if (clientInfo.result?.data) {
        let requestedScopes = request.scope?.split(' ').map(scope => scope as OAuthScope).filter(Boolean) ?? clientInfo.result.data.scopes
        return <OAuthConfirmation appInfo={clientInfo.result.data} scopes={requestedScopes} accept={() => authorize.execute(request)} />
    }
    return <div>Error getting information for this client Id</div>
}
