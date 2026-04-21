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
  id: UUIDString;
  groupOwnerId: UUIDString;
  movementName: string;
  date: DateOnly;
  dateValue?: DateOnly;
  details?: string;
  value: decimal;
  kind: string;
  comment?: string;
  labelIds: UUIDString[];
}

model NotFoundBankTransaction {
  ...NotFound;
  bankTransactionSuplied: UUIDString;
}

@route("/bank-transactions")
@tag("bank-transactions")
interface ApiBankTransactions {
  @get list(
    @query groupIds?: UUIDString[],
    @query cursor?: string,
    @query limit?: uint16 = 100,
  ): PageList<BankTransaction>;
  @doc("Link a label to a transaction")
  @route("{transactionId}/label/{labelId}")
  @post
  linkLabel(@path transactionId: UUIDString, @path labelId: UUIDString):
    | BankTransaction
    | NotFoundLabel
    | NotFoundBankTransaction
    | LabelGroupIdMismatch;
  @doc("Remove a label from a transaction")
  @route("{transactionId}/label/{labelId}")
  @delete
  unlinkLabel(
    @path transactionId: UUIDString,
    @path labelId: UUIDString,
  ): BankTransaction | NotFound | NotFoundBankTransaction;
  @doc("Set a comment into the transaction")
  @route("{transactionId}")
  @patch(#{ implicitOptionality: true })
  comment(
    @path transactionId: UUIDString,
    comment?: string,
  ): BankTransaction | NotFoundBankTransaction;
}
