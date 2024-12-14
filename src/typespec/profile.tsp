import "@typespec/http";
import "@typespec/json-schema";

import "./global.tsp";
using TypeSpec.Http;
using TypeSpec.JsonSchema;

namespace MrScrooge;

model UserGroup {
  id: UUID;
  name: string;
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

model CreateUserParams {
  ...BaseModifyUserData;
  password: string;
}

model UpdateUserData {
  ...BaseModifyUserData;
  password?: string;
  defaultGroupId: UUID;
}

model UserProfile {
  id: UUID;
  ...BaseUserData;
  isAdmin: boolean;
  isActive: boolean;
  groups: UserGroup[];
  defaultGroupId: UUID;
}

@route("/users")
@tag("user")
interface ApiUser {
  @post create(...CreateUserParams): { @statusCode _ : 201, ...UserProfile} | Unauthorized;
  @get list(
    @query cursor?: string,
    @query limit?: int16,
  ): PageList<UserProfile> | Unauthorized;
  @route("{id}") @put update(@path id: UUID, ...UpdateUserData):
    | UserProfile
    | Unauthorized
    | NotFound
    | InvalidUUID;
  @route("{id}/group/{groupId}") @delete deleteGroup(
    @path id: UUID,
    @path groupId: UUID,
  ): UserProfile | Unauthorized;
  @route("{id}/group/{groupId}") @post addGroup(
    @path id: UUID,
    @path groupId: UUID,
  ): UserProfile | Unauthorized;
  @route("{id}") @delete delete(@path id: UUID): boolean | Unauthorized;
}

@route("/groups")
@tag("user")
interface ApiGroup {
  @get list(@query cursor?: string, @query limit?: int16): UserGroup[];
  @doc("List all groups that are not assigned to a user")
  @route("orphaned")
  @get
  listOrphaned(): UserGroup[];
  @post create(...UserGroup): UserGroup;
  @route("{id}") @delete delete(@path id: UUID): void;
}
