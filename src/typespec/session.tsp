import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./global.tsp";
import "./profile.tsp";

using TypeSpec.Http;

namespace MrScrooge;

model UserCredentials {
  username: string;
  password: string;
}

enum SessionType {
  identified,
  anonymous,
}

model InvalidCredentials {
  @statusCode _: 401;
  details: string;
}

model GetMyProfile {
  user: SessionType.identified;
  profile: UserProfile;
}

model NotIdentified {
  user: SessionType.anonymous;
}

model UpdateMyProfile {
  ...BaseUserData;
  defaultGroupId: UUID;
  newPassword?: string;
  password?: string;
}

@discriminated(#{ envelope: "none", discriminatorPropertyName: "user" })
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
  @route("me") @put updateMe(...UpdateMyProfile): UserProfile | InvalidUUID;
  @doc("Logout")
  @delete
  logout(): boolean;
}
