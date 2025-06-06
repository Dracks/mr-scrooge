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
  comment?: string;
  labelIds: UUID[];
}

model NotFoundBankTransaction {
  ...NotFound;
  bankTransactionSuplied: UUID;
}

@route("/bank-transactions")
@tag("bank-transactions")
interface ApiBankTransactions {
  @get list(
    @query groupIds?: UUID[],
    @query cursor?: string,
    @query limit?: uint16 = 100,
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
  ): BankTransaction | NotFound | NotFoundBankTransaction;
  @doc("Set a comment into the transaction")
  @route("{transactionId}")
  @patch(#{implicitOptionality: true})
  comment(
    @path transactionId: UUID,
    comment?: string,
  ): BankTransaction | NotFoundBankTransaction;
}
