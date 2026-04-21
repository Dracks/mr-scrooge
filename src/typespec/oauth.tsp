import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./global.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;
using TypeSpec.Rest;

namespace MrScrooge;

enum OAuthScope {
  userInfo,
  uploadFile,
}

// Discriminated union for OAuth token request parameters based on grant type
@doc("Parameters for authorization code grant")
model AuthorizationCodeGrantParams {
  @doc("OAuth grant type")
  grant_type: "authorization_code";

  @doc("Authorization code received from authorization server")
  code: string;

  @doc("Redirect URI used in the authorization request")
  redirect_uri: string;
}

@doc("Parameters for refresh token grant")
model RefreshTokenGrantParams {
  @doc("OAuth grant type")
  grant_type: "refresh_token";

  @doc("Refresh token for refreshing access tokens")
  refresh_token: string;
}

@doc("Parameters for client credentials grant")
model ClientCredentialsGrantParams {
  @doc("OAuth grant type")
  grant_type: "client_credentials";
  // No additional parameters required for client_credentials grant
}

@doc("OAuth token request with grant-type-specific parameters")
@oneOf
union OAuthTokenRequest {
  @doc("Authorization code grant parameters")
  authorizationCode: AuthorizationCodeGrantParams,

  @doc("Refresh token grant parameters")
  refreshToken: RefreshTokenGrantParams,

  @doc("Client credentials grant parameters")
  clientCredentials: ClientCredentialsGrantParams,
}

model OAuthTokenResponse {
  @doc("Access token to access protected resources")
  access_token: string;

  @doc("Type of the access token")
  token_type: "Bearer";

  @doc("Lifetime of the access token in seconds")
  expires_in?: int32;

  @doc("Refresh token to obtain new access tokens")
  refresh_token?: string;

  @doc("Space-delimited scopes requested by the client")
  scope?: string;
}

model OAuthAuthorizeRequest {
  client_id: UUIDString;

  @doc("OAuth response type, must be 'code' for authorization code flow")
  response_type: "code";

  @doc("Redirection URI to which the response will be sent")
  redirect_uri: string;

  @doc("Space-delimited scopes requested by the client")
  scope?: string;

  @doc("Value used to associate a client session with an ID token")
  state?: string;
}

model OAuthClient {
  client_id: UUIDString;

  @doc("Name of the OAuth client")
  name: string;

  @doc("Some description used for the admin of the app")
  description?: string;

  @doc("Redirect URIs for the OAuth client")
  redirect_uris: string[];

  @doc("Scopes allowed for the OAuth client")
  scopes: OAuthScope[];

  @doc("Creation timestamp")
  created_at: utcDateTime;

  @doc("Last updated timestamp")
  updated_at: utcDateTime;
}

model OAuthClientWithSecret {
  ...OAuthClient;

  @doc("Secret for the OAuth client")
  @secret
  secret: string;
}

model OAuthAuthorizationCode {
  @doc("Authorization code")
  code: string;

  client_id: UUIDString;
  user_id: UUIDString;

  @doc("Scopes granted")
  scopes: OAuthScope[];

  @doc("Redirection URI")
  redirect_uri: string;

  @doc("Expiration time")
  expires_at: utcDateTime;
}

model OAuthAccessToken {
  @doc("Access token")
  access_token: string;

  @doc("Refresh token")
  refresh_token?: string;

  client_id: UUIDString;
  user_id?: UUIDString;

  @doc("Scopes granted")
  scopes: OAuthScope[];

  @doc("Expiration time")
  expires_at: utcDateTime;
}
model OAuthClientUpdate {
  @doc("Name of the OAuth client")
  name?: string;

  @doc("Some description used for the admin of the app")
  description?: string;

  @doc("Redirect URIs for the OAuth client")
  redirect_uris?: string[];

  @doc("Scopes allowed for the OAuth client")
  scopes?: OAuthScope[];
}

@tag("oauth")
@route("/oauth")
interface ApiOAuth {
  @doc("Initiate OAuth authorization flow")
  @get
  @route("/authorize")
  authorize(@query(#{ explode: true }) request: OAuthAuthorizeRequest):
    | {
        @statusCode _: 200;
        authorization_code: string;
        state?: string;
      }
    | Unauthorized
    | InvalidUUID
    | NotFound;

  @doc("Exchange authorization code for access token or refresh access token")
  @useAuth(BasicAuth)
  @post
  @route("/token")
  token(@body request: OAuthTokenRequest):
    | {
        @statusCode _: 200;
        ...OAuthTokenResponse;
      }
    | Unauthorized
    | NotFound
    | InvalidUUID;

  @doc("Get OAuth client details")
  @get
  @route("/clients/{clientId}")
  getClient(@path clientId: UUIDString):
    | {
        @statusCode _: 200;
        ...OAuthClient;
      }
    | Unauthorized
    | NotFound
    | InvalidUUID;

  @doc("Register a new OAuth client")
  @post
  @route("/clients")
  registerClient(
    @body client: {
      name: string;
      description?: string;
      redirect_uris: string[];
      scopes: OAuthScope[];
    },
  ): {
    @statusCode _: 201;
    ...OAuthClientWithSecret;
  } | Unauthorized | {
    @statusCode _: 400;
    ...Error;
  };

  @doc("Delete an OAuth client")
  @delete
  @route("/clients/{clientId}")
  deleteClient(@path clientId: UUIDString):
    | {
        @statusCode _: 204;
      }
    | Unauthorized
    | NotFound
    | InvalidUUID;

  @doc("Update an OAuth client")
  @patch(#{implicitOptionality: false})
  @route("/clients/{clientId}")
  updateClient(@path clientId: UUIDString, @body client: OAuthClientUpdate):
    | {
        @statusCode _: 200;
        ...OAuthClient;
      }
    | Unauthorized
    | NotFound
    | InvalidUUID;

  @doc("List OAuth clients")
  @get
  @route("/clients")
  listClients(
    @query cursor?: string,
    @query limit?: uint16 = 100,
  ): PageList<OAuthClient> | Unauthorized;
}
