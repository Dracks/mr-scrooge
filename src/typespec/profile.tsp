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
  isActive: boolean;
  isAdmin: boolean;
  defaultGroupId: UUID;
}

model UserProfile {
  id: UUID;
  ...BaseUserData;
  groups: UserGroup[];
}

@route("/users")
@tag("user")
interface ApiUser {
  @post create(...BaseUserData): UserProfile | Unauthorized;
  @get list(@query cursor?: string, @query limit?: int16): PageList<UserProfile> | Unauthorized;
  @route("{id}") @patch update(@path id: UUID, body: BaseUserData): UserProfile| Unauthorized;
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
