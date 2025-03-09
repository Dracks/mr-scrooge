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

model GraphParam {
  groupOwnerId: UUID;
  name: string;
  kind: GraphKind;
  labelFilterId?: UUID;
  dateRange: GraphDateRange;
  group: Group;
  horizontalGroup?: HorizontalGroup;
}

model Graph {
  id: UUID;
  ...GraphParam;
  order: uint64;
}

model Group {
  group: GraphGroupType;
  hideOthers?: boolean;
  labels?: UUID[];
}

model HorizontalGroup {
  ...Group;
  accumulate?: boolean;
}

model NotFoundLabels {
  ...NotFound;
  validLabels: UUID[];
  invalidLabels: UUID[];
}

enum MoveDirection {
  up,
  down,
}

@tag("graphs")
@route("/graphs")
interface ApiGraphs {
  @post create(...GraphParam): {
    @statusCode _: 201;
    ...Graph;
  } | InvalidGroupOwnerId | NotFoundLabels;
  @get list(
    @query graphIds?: UUID[],
    @query cursor?: string,
    @query limit?: uint16 = 100,
  ): PageList<Graph>;
  @route("/{id}") @put update(@path id: UUID, ...GraphParam):
    | Graph
    | InvalidGroupOwnerId
    | NotFoundLabels
    | NotFound;
  @doc("Move up or down a graph inside the list of graphs for the same user group")
  @route("/{id}/move")
  @put
  move(
    @path id: UUID,
    direction: MoveDirection,
  ): List<Graph> | NotFound | InvalidUUID;
  @route("/{id}") @delete delete(@path id: UUID): boolean | NotFound;
}
