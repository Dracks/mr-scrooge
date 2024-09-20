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

@route("/profiles")
@tag("profile")
interface ApiProfile {
  @post create(...BaseUserData): UserProfile;
  @route("{id}") @patch update(@path id: UUID, body: BaseUserData): UserProfile;
  @route("{id}/group/{groupId}") @delete deleteGroup(
    @path id: UUID,
    @path groupId: UUID,
  ): void;
  @route("{id}/group/{groupId}") @post addGroup(
    @path id: UUID,
    @path groupId: UUID,
  ): void;
  @get get(@query cursor?: string, @query limit?: int16): PageList<UserProfile>;
  @route("{id}") @delete delete(@path id: UUID): boolean;
}

@route("/groups")
@tag("profile")
interface ApiGroup {
  @get list(@query cursor?: string, @query limit?: int16): UserGroup[];
  @doc("List all groups that are not assigned to a user")
  @route("orphaned")
  @get
  listOrphaned(): UserGroup[];
  @post create(...UserGroup): UserGroup;
  @route("{id}") @delete delete(@path id: UUID): void;
}
