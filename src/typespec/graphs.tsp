import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./global.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;
using TypeSpec.Rest;

namespace MrScrooge;

enum GraphKind {
  bar,
  line,
  pie,
}

enum GraphGroupType {
  day,
  labels,
  month,
  sign,
  year,
}

enum GraphDateRange {
  all,
  halfYear,
  oneMonth,
  oneYear,
  sixYears,
  twoYears,
}

model GraphInput {
  groupOwnerId: UUIDString;
  name: string;
  kind: GraphKind;
  labelFilterId?: UUIDString;
  dateRange: GraphDateRange;
  group: Group;
  horizontalGroup?: HorizontalGroup;
}

model Graph {
  id: UUIDString;
  ...GraphInput;
  order: uint64;
}

model Group {
  group: GraphGroupType;
  hideOthers?: boolean;
  labels?: UUIDString[];
}

model HorizontalGroup {
  ...Group;
  accumulate?: boolean;
}

model NotFoundLabels {
  ...NotFound;
  validLabels: UUIDString[];
  invalidLabels: UUIDString[];
}

enum MoveDirection {
  up,
  down,
}

@tag("graphs")
@route("/graphs")
interface ApiGraphs {
  @post create(...GraphInput): {
    @statusCode _: 201;
    ...Graph;
  } | InvalidGroupOwnerId | NotFoundLabels;
  @get list(
    @query graphIds?: UUIDString[],
    @query cursor?: string,
    @query limit?: uint16 = 100,
  ): PageList<Graph>;
  @route("/{id}") @put update(@path id: UUIDString, ...GraphInput):
    | Graph
    | InvalidGroupOwnerId
    | NotFoundLabels
    | NotFound;
  @doc("Move up or down a graph inside the list of graphs for the same user group")
  @route("/{id}/move")
  @put
  move(
    @path id: UUIDString,
    direction: MoveDirection,
  ): List<Graph> | NotFound | InvalidUUID;
  @route("/{id}") @delete delete(@path id: UUIDString): boolean | NotFound;
}
