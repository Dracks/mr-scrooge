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

model RuleParam {
  parentRuleId?: UUID;
  groupOwnerId: UUID;
  name: string;
  relations: ConditionalRelation;
}

model Rule {
  id: UUID;
  ...RuleParam;
  conditions: Condition[];
  labelIds: UUID[];
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
  id: UUID;
  operation: OperationString;
  value: string;
}

model ConditionDouble {
  id: UUID;
  operation: OperationDouble;
  value: float64;
}

@oneOf
union Condition {
  double: ConditionDouble,
  string: ConditionString,
}

model ConditionParamDouble {
  operation: OperationDouble;
  value: float64;
}
model ConditionParamString {
  operation: OperationString;
  value: string;
}

@oneOf
union ConditionParams {
  double: ConditionParamDouble,
  string: ConditionParamString,
}

model SetLabelAction {
  label: UUID;
}

@doc("Unprocessable entity, assigning as parent a direct or indirect child")
model ItsOwnParent {
  @statusCode _: 422;
  ...Error;
}

model HasChildren {
  @statusCode _: 422;
  ...Error;
  childrenIds: UUID[];
}

@route("/rules")
@tag("rule")
interface ApiRule {
  list(@query cursor?: string, @query limit?: int16): PageList<Rule>;
  @post create(...RuleParam):
    | {
        @statusCode _: 201;
        ...Rule;
      }
    | InvalidGroupOwnerId
    | InvalidUUID
    | NotFound;
  @put @route("{ruleId}") update(@path ruleId: UUID, ...RuleParam):
    | Rule
    | InvalidGroupOwnerId
    | InvalidUUID
    | NotFound
    | ItsOwnParent;
  @post @route("{ruleId}/apply") apply(@path ruleId: UUID):
    | NotFound
    | InvalidGroupOwnerId
    | InvalidUUID
    | NotFound
    | Date;
  @delete @route("{ruleId}") delete(@path ruleId: UUID):
    | boolean
    | NotFound
    | HasChildren
    | InvalidUUID;

  // Here is the conditions
  @post @route("{ruleId}/condition") addCondition(
    @path ruleId: UUID,
    condition: ConditionParams,
  ): Rule | NotFound | InvalidUUID;
  @put @route("{ruleId}/condition/{condId}") updateCondition(
    @path ruleId: UUID,
    @path condId: UUID,
    condition: ConditionParams,
  ): Rule | NotFound | InvalidUUID;
  @delete @route("{ruleId}/condition/{condId}") removeCondition(
    @path ruleId: UUID,
    @path condId: UUID,
  ): Rule | NotFound | InvalidUUID;

  // Here is the labels actions
  @put @route("{ruleId}/label/{labelId}") addLabel(
    @path ruleId: UUID,
    @path labelId: UUID,
  ): Rule | NotFound | InvalidUUID | LabelGroupIdMismatch;
  @delete @route("{ruleId}/label/{labelId}") removeLabel(
    @path ruleId: UUID,
    @path labelId: UUID,
  ): Rule | NotFound | InvalidUUID;
}
