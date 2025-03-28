import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./global.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;
using TypeSpec.Rest;

namespace MrScrooge;

enum ImportStatus {
  ok,
  warning,
  error,
}

// Todo: add the groupOwnerId
model UploadData {
  kind: string;
  file: bytes;
}

model FileImport {
  id: UUID;
  createdAt: Date;
  description: string;
  fileName: string;
  groupOwnerId: UUID;
  kind: string;
  status: ImportStatus;
  context: string | null;
  rows: FileImportTransaction[];
}

model FileImportTransaction {
  movementName: string;
  date: string;
  dateValue?: string;
  details?: string;
  value: decimal;
  description?: string;
  message?: string;
  transactionId?: UUID;
}

model FileParserType {
  name: string;
  fileNameRegex: string;
}

model ListFileParsers {
  parsers: FileParserType[];
}

@route("imports")
@tag("imports")
interface ApiImports {
  // @post upload(@header contentType: "multipart/form-data", ...UploadData): {@statusCode _: 201, ...FileImport} | InvalidGroupOwnerId | NotFound;
  @get list(@query cursor?: string, @query limit?: int16): PageList<FileImport>;
  @route("parsers") @get parserTypes(): ListFileParsers;
  @delete delete(@path id: UUID): boolean;
  @doc("This will allow to delete a transaction using the file-import rowId")
  @route("{id}/rollback/{rowId}")
  @delete
  rollbackImport(@path id: UUID, @path rowId: UUID): boolean;
  @doc("This will allow to create a transaction from the file-import rowId")
  @route("{id}/apply/{rowId}")
  @post
  applyRow(@path id: UUID, @path rowId: UUID): boolean;
}
