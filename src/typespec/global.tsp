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
model NotFound {
  @statusCode _: 404;
  ...Error;
}

model PageList<Item> {
  results: Item[];
  next?: string;
}
