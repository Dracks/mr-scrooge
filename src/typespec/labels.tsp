import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./global.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;
using TypeSpec.Rest;

namespace MrScrooge;

model UpdateLabel {
  name: string;
  // color: string;
}

model CreateLabel {
  ...UpdateLabel;
  groupOwnerId: UUIDString;
}

model Label {
  id: UUIDString;
  ...CreateLabel;
}

model NotFoundLabel {
  ...NotFound;
  labelSuplied: UUIDString;
}

model LabelInUse {
  @statusCode _: 409;
  graphs: UUIDString[];
  graphsGroup: UUIDString[];
  graphHorizontalGroup: UUIDString[];
  rules: UUIDString[];
  transactions: UUIDString[];
}

@route("/labels")
@tag("labels")
interface ApiLabels {
  @get list(@query cursor?: string, @query limit?: uint16): PageList<Label>;
  @post create(...CreateLabel): {
    @statusCode _: 201;
    ...Label;
  } | InvalidGroupOwnerId | InvalidUUID;
  @put @route("{labelId}") update(
    @path labelId: UUIDString,
    ...UpdateLabel,
  ): Label | NotFound | InvalidUUID;
  @delete @route("{labelId}") delete(
    @path labelId: UUIDString,

    @doc("When true, forcefully deletes the label and removes it from all relations. Use with caution as this will modify dependent entities.")
    @query
    force?: boolean = false,
  ): boolean | NotFound | InvalidUUID | LabelInUse;
}
