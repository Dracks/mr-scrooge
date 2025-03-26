import "@typespec/http";
import "@typespec/openapi";
import "./session.tsp";
import "./bank-transactions.tsp";
import "./labels.tsp";
import "./profile.tsp";
import "./graphs.tsp";
import "./imports.tsp";
import "./rules.tsp";

using TypeSpec.Http;

@service({
  title: "Mr Scrooge API",
  description: "API for Mr Scrooge",
})
@TypeSpec.OpenAPI.info({
  version: "3.0.0",
})
@server("/api", "Development")
namespace MrScrooge;
