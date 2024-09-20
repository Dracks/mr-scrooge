import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./global.tsp";
import "./profile.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;
using TypeSpec.Rest;

namespace MrScrooge;

model UserCredentials {
  username: string;
  password: string;
}

model InvalidCredentials {
  @statusCode _: 401;
  details: string;
}

model GetMyProfile {
  user: "identified";
  profile: UserProfile;
}

model NotIdentified {
  user: "anonymous";
}

@discriminator("user")
@oneOf
union CheckMyProfile {
  identified: GetMyProfile,
  anonymous: NotIdentified,
}

@tag("session")
@route("/session")
interface ApiSession {
  @doc("Login")
  @post
  login(...UserCredentials): UserProfile | InvalidCredentials;
  @doc("Check if the user is logged in")
  @get
  me(): CheckMyProfile | Error;
  @doc("Logout")
  @delete
  logout(): boolean;
}
