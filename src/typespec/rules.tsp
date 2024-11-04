import "@typespec/http";
import "@typespec/openapi3";

import "./global.tsp";
using TypeSpec.Http;
using OpenAPI;

namespace MrScrooge;

enum ConditionalRelation{
    and,
    notOr,
}

model RuleParam{
    parentRule?: UUID;
    groupOwnerId: UUID;
    name: string;
    relations: ConditionalRelation;
}

model Rule {
    id: UUID;
    ...RuleParam;
    conditions: Condition[];
}

enum OperationString {
    contains,
    prefix,
    regularExpression,
    suffix,
}

enum OperationFloat {
    greater,
    greaterEqual,
    lower,
    lowerEqual,
}

model ConditionString {
    id: UUID;
    operation: OperationString;
    value: string;
}

model ConditionFloat {
    id: UUID;
    operation: OperationFloat;
    value: float;
}

@oneOf
union Condition {
    float: ConditionFloat,
    string: ConditionString,
}


model SetLabelAction {
    label: UUID;
}



@route("/rules")
@tag("rule")
interface ApiRule {
    list(): Rule[];
    @post create(...RuleParam) : Rule | InvalidGroupId;
    @put @route("{ruleId}") update(@path ruleId: UUID, ...RuleParam): Rule | InvalidGroupId | NotFound;
    @post @route("{ruleId}/apply") apply(@path ruleId: UUID): NotFound | InvalidGroupId | Date;
    @delete @route("{ruleId}") delete(@path ruleId: UUID): Date;

    // Here is the conditions
    @post @route("{ruleId}/condition") addCondition(@path ruleId: UUID): Condition;
    @put @route("{ruleId}/condition/{condId}") updateCondition(@path ruleId: UUID, @path condId: UUID): Condition;
    @delete @route("{ruleId}/condition/{condId}") deleteCondition(@path ruleId: UUID, @path condId: UUID): Date;

}
