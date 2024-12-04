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
  groupOwnerId: UUID;
}

model Label {
  id: UUID;
  ...CreateLabel;
}

model NotFoundLabel {
  ...NotFound;
  labelSuplied: UUID;
}

@route("/labels")
@tag("labels")
interface ApiLabels {
  @get list(@query cursor?: string, @query limit?: uint16): PageList<Label>;
  @post create(...CreateLabel): Label | InvalidGroupOwnerId | InvalidUUID;
  @put @route("{labelId}") update(
    @path labelId: UUID,
    ...UpdateLabel,
  ): Label | NotFound | InvalidUUID;
  @delete @route("{labelId}") delete(
    @path labelId: UUID,
  ): Label | NotFound | InvalidUUID;
}
