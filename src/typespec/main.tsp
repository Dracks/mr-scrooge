import "@typespec/http";
import "@typespec/openapi";
import "./session.tsp";
import "./bank-transactions.tsp";
import "./labels.tsp";
import "./profile.tsp";
import "./graphs.tsp";
import "./imports.tsp";
import "./rules.tsp";

using Http;

@service(#{ title: "Mr Scrooge API" })
@server("/api", "Development")
namespace MrScrooge;
