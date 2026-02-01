import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./global.tsp";

using TypeSpec.Http;

namespace MrScrooge;

model OAuthTokenRequest {
  @doc("OAuth grant type")
  grant_type: "authorization_code" | "refresh_token" | "client_credentials";
  
  @doc("Authorization code received from authorization server")
  code?: string;
  
  @doc("Redirect URI used in the authorization request")
  redirect_uri?: string;
  
  @doc("Refresh token for refreshing access tokens")
  refresh_token?: string;
  
  @doc("Client identifier")
  client_id?: string;
  
  @doc("Client secret")
  @secret
  client_secret?: string;
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
  
  @doc("Scope of the access token")
  scope?: string;
}

model OAuthAuthorizeRequest {
  @doc("Client identifier")
  client_id: string;
  
  @doc("Redirection URI to which the response will be sent")
  redirect_uri: string;
  
  @doc("Scope of the access request")
  scope?: string;
  
  @doc("Value used to associate a client session with an ID token")
  state?: string;
  
  @doc("Indicates whether the user should be prompted for re-authentication")
  prompt?: "none" | "login" | "consent";
}

model OAuthErrorResponse {
  @doc("Error code")
  error: string;
  
  @doc("Human-readable text providing additional information about the error")
  error_description?: string;
  
  @doc("URI identifying a human-readable web page with information about the error")
  error_uri?: string;
}

model OAuthClient {
  @doc("Unique identifier for the OAuth client")
  id: UUID;
  
  @doc("Name of the OAuth client")
  name: string;
  
  @doc("Secret for the OAuth client")
  @secret
  secret: string;
  
  @doc("Redirect URIs for the OAuth client")
  redirect_uris: string[];
  
  @doc("Scopes allowed for the OAuth client")
  scopes: string[];
  
  @doc("Creation timestamp")
  createdAt: utcDateTime;
  
  @doc("Last updated timestamp")
  updatedAt: utcDateTime;
}

model OAuthAuthorizationCode {
  @doc("Authorization code")
  code: string;
  
  @doc("Client identifier")
  client_id: UUID;
  
  @doc("User identifier")
  user_id: UUID;
  
  @doc("Scopes granted")
  scopes: string[];
  
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
  
  @doc("Client identifier")
  client_id: UUID;
  
  @doc("User identifier")
  user_id: UUID;
  
  @doc("Scopes granted")
  scopes: string[];
  
  @doc("Expiration time")
  expires_at: utcDateTime;
}

@tag("oauth")
@route("/oauth")
interface ApiOAuth {
  @doc("Initiate OAuth authorization flow")
  @get
  @route("/authorize")
  authorize(@query request: OAuthAuthorizeRequest): {
    @statusCode _: 200;
    body: {
      authorization_code: string;
      state?: string;
    } | OAuthErrorResponse;
  };
  
  @doc("Exchange authorization code for access token or refresh access token")
  @post
  @route("/token")
  token(
    @header contentType: "application/x-www-form-urlencoded",
    @body request: OAuthTokenRequest
  ): {
    @statusCode _: 200;
    body: OAuthTokenResponse;
  } | {
    @statusCode _: 400 | 401;
    body: OAuthErrorResponse;
  };
  
  @doc("Get OAuth client details")
  @get
  @route("/clients/{clientId}")
  getClient(@path clientId: UUID): {
    @statusCode _: 200;
    body: OAuthClient;
  } | {
    @statusCode _: 404;
    body: OAuthErrorResponse;
  };
  
  @doc("Register a new OAuth client")
  @post
  @route("/clients")
  registerClient(
    @body client: {
      name: string;
      redirect_uris: string[];
      scopes: string[];
    }
  ): {
    @statusCode _: 201;
    body: OAuthClient;
  } | {
    @statusCode _: 400;
    body: OAuthErrorResponse;
  };
  
  @doc("Delete an OAuth client")
  @delete
  @route("/clients/{clientId}")
  deleteClient(@path clientId: UUID): {
    @statusCode _: 204;
  } | {
    @statusCode _: 404;
    body: OAuthErrorResponse;
  };
}