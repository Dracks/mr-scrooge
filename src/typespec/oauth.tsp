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
}

model OAuthTokenRequest {
  @doc("OAuth grant type")
  grant_type: "authorization_code" | "refresh_token" | "client_credentials";

  @doc("Authorization code received from authorization server")
  code?: string;

  @doc("Redirect URI used in the authorization request")
  redirect_uri?: string;

  @doc("Refresh token for refreshing access tokens")
  refresh_token?: string;
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

  @doc("Scopes of the access token")
  scopes?: OAuthScope[];
}

model OAuthAuthorizeRequest {
  client_id: UUIDString;

  @doc("Redirection URI to which the response will be sent")
  redirect_uri: string;

  @doc("Scope of the access request")
  scopes?: OAuthScope[];

  @doc("Value used to associate a client session with an ID token")
  state?: string;
}

model OAuthClient {
  client_id: UUIDString;

  @doc("Name of the OAuth client")
  name: string;

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

  user_id: UUIDString;

  @doc("Scopes granted")
  scopes: OAuthScope[];

  @doc("Expiration time")
  expires_at: utcDateTime;
}


@tag("oauth")
@route("/oauth")
interface ApiOAuth {
  @doc("Initiate OAuth authorization flow")
  @get
  @route("/authorize")
  authorize(@query(#{ explode: true }) request: OAuthAuthorizeRequest): {
    @statusCode _: 200;
    body: {
      authorization_code: string;
      state?: string;
    };
  } | Unauthorized | InvalidUUID | NotFound;
  
  @doc("Exchange authorization code for access token or refresh access token")
  @useAuth(BasicAuth)
  @post
  @route("/token")
  token(
    @body request: OAuthTokenRequest
  ): {
    @statusCode _: 200;
    body: OAuthTokenResponse;
  } | Unauthorized | {
    @statusCode _: 400;
    body: Error;
  };
  
  @doc("Get OAuth client details")
  @get
  @route("/clients/{clientId}")
  getClient(@path clientId: UUIDString): {
    @statusCode _: 200;
    body: OAuthClient;
  } | Unauthorized | NotFound | InvalidUUID;

  @doc("Register a new OAuth client")
  @post
  @route("/clients")
  registerClient(
    @body client: {
      name: string;
      redirect_uris: string[];
      scopes: OAuthScope[];
    }
  ): {
    @statusCode _: 201;
    body: OAuthClientWithSecret;
  } | Unauthorized | {
    @statusCode _: 400;
    body: Error;
  };

  @doc("Delete an OAuth client")
  @delete
  @route("/clients/{clientId}")
  deleteClient(@path clientId: UUIDString): {
    @statusCode _: 204;
  } | Unauthorized | NotFound;
}