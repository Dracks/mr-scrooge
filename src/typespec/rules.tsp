import "@typespec/http";
import "@typespec/json-schema";

import "./global.tsp";
using TypeSpec.Http;
using TypeSpec.JsonSchema;

namespace MrScrooge;

enum ConditionalRelation{
    and,
    notOr,
}

enum Operation {
    greater,
    greaterEqual,
    lower,
    lowerEqual,
    contains,
    prefix,
    regularExpression,
    suffix,
}

model Rule {
    id: UUID;
    parentRule?: UUID;
    groupOwnerId: UUID;
    name: string;
    relations: ConditionalRelation;
    conditions: Condition[];
}

model Condition {
    id: UUID;
    operation: Operation;
    value: string;
}

model SetLabelAction {
    label: UUID;
}


@route("/rules")
@tag("rule")
interface ApiRule {
    list(): Rule[]
}
