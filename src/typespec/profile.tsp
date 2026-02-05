import "@typespec/http";
import "@typespec/json-schema";

import "./global.tsp";
using TypeSpec.Http;
using TypeSpec.JsonSchema;

namespace MrScrooge;

model UserGroupInput {
  name: string;
}

model UserGroup {
  id: UUIDString;
  ...UserGroupInput;
}

model BaseUserData {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}
model BaseModifyUserData {
  ...BaseUserData;
  isActive: boolean;
  isAdmin: boolean;
}

model CreateUserInput {
  ...BaseModifyUserData;
  password: string;
}

model UpdateUserData {
  ...BaseModifyUserData;
  password?: string;
  defaultGroupId: UUIDString;
}

model UserProfile {
  id: UUIDString;
  ...BaseUserData;
  isAdmin: boolean;
  isActive: boolean;
  groups: UserGroup[];
  defaultGroupId: UUIDString;
}

@route("/users")
@tag("user")
interface ApiUser {
  @post create(...CreateUserInput): {
    @statusCode _: 201;
    ...UserProfile;
  } | Unauthorized;
  @get list(
    @query cursor?: string,
    @query limit?: int16,
  ): PageList<UserProfile> | Unauthorized;
  @route("{id}") @put update(@path id: UUIDString, ...UpdateUserData):
    | UserProfile
    | Unauthorized
    | NotFound
    | InvalidUUID;
  @route("{id}/group/{groupId}") @delete deleteGroup(
    @path id: UUIDString,
    @path groupId: UUIDString,
  ): UserProfile | Unauthorized;
  @route("{id}/group/{groupId}") @post addGroup(
    @path id: UUIDString,
    @path groupId: UUIDString,
  ): UserProfile | Unauthorized;
  @route("{id}") @delete delete(@path id: UUIDString): boolean | Unauthorized;
}

@route("/groups")
@tag("user")
interface ApiGroup {
  @post create(...UserGroupInput): {
    @statusCode _: 201;
    ...UserGroup;
  };
  @get list(
    @query cursor?: string,
    @query limit?: int16,
    @query orphaned?: boolean,
  ): PageList<UserGroup>;
  @route("{id}") @put updateGroup(
    @path id: UUIDString,
    ...UserGroupInput,
  ): UserGroup | NotFound;
  @route("{id}") @delete delete(@path id: UUIDString): void | Unauthorized;
}
