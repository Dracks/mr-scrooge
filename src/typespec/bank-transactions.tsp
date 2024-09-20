import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./global.tsp";
import "./labels.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;
using TypeSpec.Rest;

namespace MrScrooge;

model BankTransaction {
  id: UUID;
  groupOwnerId: UUID;
  movementName: string;
  date: DateOnly;
  dateValue?: DateOnly;
  details?: string;
  value: decimal;
  kind: string;
  description?: string;
  labelIds: UUID[];
}

model NotFoundBankTransaction {
  ...NotFound;
  bankTransactionSuplied: UUID;
}

model LabelGroupIdMismatch {
  @statusCode _: 409;
  ...Error;
}

@route("/bank-transactions")
@tag("bank-transactions")
interface ApiBankTransactions {
  @get list(
    @query groupIds?: UUID[],
    @query cursor?: string,
    @query limit?: int16,
  ): PageList<BankTransaction>;
  @doc("Link a label to a transaction")
  @route("{transactionId}/label/{labelId}")
  @post
  linkLabel(@path transactionId: UUID, @path labelId: UUID):
    | BankTransaction
    | NotFoundLabel
    | NotFoundBankTransaction
    | LabelGroupIdMismatch;
  @doc("Remove a label from a transaction")
  @route("{transactionId}/label/{labelId}")
  @delete
  unlinkLabel(
    @path transactionId: UUID,
    @path labelId: UUID,
  ): BankTransaction | NotFound;
}
