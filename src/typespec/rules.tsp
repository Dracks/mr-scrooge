import "@typespec/http";
import "@typespec/openapi3";

import "./global.tsp";
using TypeSpec.Http;
using OpenAPI;

namespace MrScrooge;

enum ConditionalRelation {
  or,
  notAnd,
}

model RuleInput {
  parentRuleId?: UUIDString;
  groupOwnerId: UUIDString;
  name: string;
  relations: ConditionalRelation;
}

model Rule {
  id: UUIDString;
  ...RuleInput;
  conditions: Condition[];
  labelIds: UUIDString[];
}

enum OperationString {
  suffix,
  contains,
  prefix,
  regularExpression,
}

enum OperationDouble {
  greater,
  greaterEqual,
  less,
  lessEqual,
}

model ConditionString {
  id: UUIDString;
  operation: OperationString;
  value: string;
}

model ConditionDouble {
  id: UUIDString;
  operation: OperationDouble;
  value: float64;
}

@oneOf
union Condition {
  double: ConditionDouble,
  string: ConditionString,
}

model ConditionDoubleInput {
  operation: OperationDouble;
  value: float64;
}
model ConditionStringInput {
  operation: OperationString;
  value: string;
}

@oneOf
union ConditionInput {
  double: ConditionDoubleInput,
  string: ConditionStringInput,
}

model SetLabelAction {
  label: UUIDString;
}

@doc("Unprocessable entity, assigning as parent a direct or indirect child")
model ItsOwnParent {
  @statusCode _: 422;
  ...Error;
}

model HasChildren {
  @statusCode _: 422;
  ...Error;
  childrenIds: UUIDString[];
}

@route("/rules")
@tag("rule")
interface ApiRule {
  list(@query cursor?: string, @query limit?: int16): PageList<Rule>;
  @post create(...RuleInput):
    | {
        @statusCode _: 201;
        ...Rule;
      }
    | InvalidGroupOwnerId
    | InvalidUUID
    | NotFound;
  @put @route("{ruleId}") update(@path ruleId: UUIDString, ...RuleInput):
    | Rule
    | InvalidGroupOwnerId
    | InvalidUUID
    | NotFound
    | ItsOwnParent;
  @post @route("{ruleId}/apply") apply(@path ruleId: UUIDString):
    | NotFound
    | InvalidGroupOwnerId
    | InvalidUUID
    | NotFound
    | Date;
  @delete @route("{ruleId}") delete(@path ruleId: UUIDString):
    | boolean
    | NotFound
    | HasChildren
    | InvalidUUID;

  // Here is the conditions
  @post @route("{ruleId}/condition") addCondition(
    @path ruleId: UUIDString,
    condition: ConditionInput,
  ): Rule | NotFound | InvalidUUID;
  @put @route("{ruleId}/condition/{condId}") updateCondition(
    @path ruleId: UUIDString,
    @path condId: UUIDString,
    condition: ConditionInput,
  ): Rule | NotFound | InvalidUUID;
  @delete @route("{ruleId}/condition/{condId}") removeCondition(
    @path ruleId: UUIDString,
    @path condId: UUIDString,
  ): Rule | NotFound | InvalidUUID;

  // Here is the labels actions
  @put @route("{ruleId}/label/{labelId}") addLabel(
    @path ruleId: UUIDString,
    @path labelId: UUIDString,
  ): Rule | NotFound | InvalidUUID | LabelGroupIdMismatch;
  @delete @route("{ruleId}/label/{labelId}") removeLabel(
    @path ruleId: UUIDString,
    @path labelId: UUIDString,
  ): Rule | NotFound | InvalidUUID;
}
