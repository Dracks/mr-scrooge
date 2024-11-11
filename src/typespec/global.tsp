import "@typespec/http";

using TypeSpec.Http;

@doc("something")
scalar ErrorCode extends string;
@format("uuid")
scalar UUID extends string;
@format("date")
scalar DateOnly extends string;
@format("date-time")
scalar Date extends string;

@error
model Error {
  message: string;
  code: ErrorCode;
}

@error
@doc("Unauthorized, usually when using a group that the user doesn't have access to")
model InvalidGroupOwnerId {
  @statusCode _: 401;
  ...Error;
  validGroupOwners: UUID[];
}

@error
@doc("Bad request, usually when providing an invalid string as UUID")
model InvalidUUID {
  @statusCode _: 400;
  ...Error;
}

@error
model NotFound {
  @statusCode _: 404;
  ...Error;
}

@error
model Unauthorized {
  @statusCode _: 401;
  ...Error;
}

@error
model LabelGroupIdMismatch {
  @statusCode _: 409;
  ...Error;
}

model PageList<Item> {
  results: Item[];
  next?: string;
}
