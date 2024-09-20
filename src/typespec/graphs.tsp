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
}

model Group {
  group: GraphGroupType;
  hideOthers: boolean | null;
  labels: UUID[] | null;
}

model HorizontalGroup {
  ...Group;
  accumulate: boolean | null;
}


model NotFoundLabels {
  ...NotFound;
  validLabels: UUID[];
  invalidLabels: UUID[];
}

@tag("graphs")
@route("/graphs")
interface ApiGraphs {
  @get list(
    @query graphIds?: [UUID],
    @query cursor?: string,
    @query limit?: int32 = 100,
  ): PageList<Graph>;
  @post new(...GraphParam): Graph | InvalidGroupOwnerId | NotFoundLabels;
  @route("/{id}") @patch update(@path id: UUID, ...GraphParam): Graph | InvalidGroupOwnerId | NotFoundLabels | NotFound;
  @route("/{id}") @delete delete(@path id: UUID): boolean;
}
