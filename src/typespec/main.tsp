import "@typespec/http";
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
@server("/api", "Development")
namespace MrScrooge;
