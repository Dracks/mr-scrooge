import Fluent
import Foundation
import OpenAPIRuntime
import Vapor
import swift_macros

extension MrScroogeAPIImpl {
	func ApiRule_list(_ input: Operations.ApiRule_list.Input) async throws
		-> Operations.ApiRule_list.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }

		let data = try await request.application.ruleService.getAll(
			groupIds: validGroupsIds,
			pageQuery: .init(
				limit: input.query.limit ?? 100, cursor: input.query.cursor))
		return try .ok(
			.init(
				body: .json(
					.init(
						results: data.list.map { try .init(rule: $0) },
						next: data.next))))
	}

	func ApiRule_create(_ input: Operations.ApiRule_create.Input) async throws
		-> Operations.ApiRule_create.Output
	{
		let user = try await getUser(fromRequest: request)
		let userGroupId: UUID
		let rule: Components.Schemas.RuleInput
		let parent: Rule?
		switch input.body {
		case .json(let _data):
			rule = _data
		}
		switch try (TransformerAndValidator.groupOwner(rule, on: request.db, for: user)) {
		case .notUuid:
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "GroupOwner ID is not an UUID",
							code: ApiError.API10022.rawValue))))
		case .notOwned(let validGroups):
			return .forbidden(
				.init(
					body: .json(
						.init(
							message: "Invalid Group Owner ID",
							code: ApiError.API10021.rawValue,
							validGroupOwners: validGroups.map {
								$0.uuidString
							}))))
		case .ok(let _groupId):
			userGroupId = _groupId
		}

		switch try await
			(TransformerAndValidator.parentRule(rule, on: request.db, for: userGroupId))
		{
		case .notUuid:
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "Parent ID not an UUID",
							code: ApiError.API10023.rawValue))))
		case .notFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Parent ID not found",
							code: ApiError.API10024.rawValue))))
		case .ok(let _parent):
			parent = _parent
		}

		let newRule = try await request.application.ruleService.create(
			rule: .init(
				groupOwnerId: userGroupId, name: rule.name,
				relations: rule.relations.toInternal(),
				parentId: try parent?.requireID()))

		return .created(.init(body: .json(try .init(rule: newRule))))
	}

	func ApiRule_update(_ input: Operations.ApiRule_update.Input) async throws
		-> Operations.ApiRule_update.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		let userGroupId: UUID
		let inputRule: Components.Schemas.RuleInput
		let parent: Rule?
		switch input.body {
		case .json(let _data):
			inputRule = _data
		}
		guard let ruleId = UUID(uuidString: input.path.ruleId) else {
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "Rule ID should be an UUID",
							code: ApiError.API10026.rawValue))))
		}
		switch try
			(TransformerAndValidator.groupOwner(inputRule, on: request.db, for: user))
		{
		case .notUuid:
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "GroupOwner ID is not an UUID",
							code: ApiError.API10027.rawValue))))
		case .notOwned(let validGroups):
			return .forbidden(
				.init(
					body: .json(
						.init(
							message: "Invalid Group Owner ID",
							code: ApiError.API10028.rawValue,
							validGroupOwners: validGroups.map {
								$0.uuidString
							}))))
		case .ok(let _groupId):
			userGroupId = _groupId
		}

		switch try await
			(TransformerAndValidator.parentRule(
				inputRule, ruleId: ruleId, on: request.db, for: userGroupId))
		{
		case .parentRule(.notUuid):
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "Parent ID not an UUID",
							code: ApiError.API10029.rawValue))))
		case .parentRule(.notFound):
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Parent ID not found",
							code: ApiError.API10030.rawValue))))
		case .parentRule(.ok(let _parent)):
			parent = _parent
		case .itsOwnParent:
			return .unprocessableContent(
				.init(
					body: .json(
						.init(
							message:
								"New parent is a child or a child of a child from the current rule",
							code: ApiError.API10031.rawValue))))

		}
		switch try await request.application.ruleService.updateRule(
			withId: ruleId,
			rule: .init(
				groupOwnerId: userGroupId, name: inputRule.name,
				relations: inputRule.relations.toInternal(),
				parentId: try parent?.requireID()), for: validGroupsIds)
		{
		case .notFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Rule not found",
							code: ApiError.API10032.rawValue))))
		case .ok(let rule):
			return .ok(.init(body: .json(try .init(rule: rule))))
		}
	}

	func ApiRule_delete(_ input: Operations.ApiRule_delete.Input) async throws
		-> Operations.ApiRule_delete.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }

		guard let ruleId = UUID(uuidString: input.path.ruleId) else {
			return #BasicBadRequest(
				msg: "Rule ID should be an UUID", code: ApiError.API10033)
		}
		switch try await request.application.ruleService.deleteRule(
			withId: ruleId, for: validGroupsIds)
		{
		case .ok:
			return .ok(.init(body: .json(true)))
		case .notFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Rule not found",
							code: ApiError.API10034.rawValue))))
		case .hasChildren(let childrenIds):
			return .unprocessableContent(
				.init(
					body: .json(
						.init(
							message: "Rule has childrens",
							code: ApiError.API10035.rawValue,
							childrenIds: childrenIds.map {
								$0.uuidString
							}))))
		}
	}

	func ApiRule_apply(_ input: Operations.ApiRule_apply.Input) async throws
		-> Operations.ApiRule_apply.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiRule_addCondition(_ input: Operations.ApiRule_addCondition.Input) async throws
		-> Operations.ApiRule_addCondition.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }

		guard let ruleId = UUID(uuidString: input.path.ruleId) else {
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "Rule ID should be an UUID",
							code: ApiError.API10036.rawValue))))
		}
		let baseCondition: Rule.BaseCondition
		switch input.body {
		case .json(let inputData):
			baseCondition = inputData.condition.toBaseCondition()
		}
		switch try await request.application.ruleService.addCondition(
			condition: baseCondition, forRule: ruleId, for: validGroupsIds)
		{
		case .ok(let rule):
			return .ok(.init(body: .json(try .init(rule: rule))))
		case .notFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Rule not found",
							code: ApiError.API10037.rawValue))))
		}
	}

	func ApiRule_updateCondition(_ input: Operations.ApiRule_updateCondition.Input) async throws
		-> Operations.ApiRule_updateCondition.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }

		guard let ruleId = UUID(uuidString: input.path.ruleId) else {
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "Rule ID should be an UUID",
							code: ApiError.API10038.rawValue))))
		}
		guard let conditionId = UUID(uuidString: input.path.condId) else {
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "Condition ID should be an UUID",
							code: ApiError.API10039.rawValue))))
		}
		let baseCondition: Rule.BaseCondition
		switch input.body {
		case .json(let inputData):
			baseCondition = inputData.condition.toBaseCondition()
		}
		switch try await request.application.ruleService.updateCondition(
			conditionId,
			condition: baseCondition, forRule: ruleId, for: validGroupsIds)
		{
		case .ok(let rule):
			return .ok(.init(body: .json(try .init(rule: rule))))
		case .notFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "condition not found",
							code: ApiError.API10040.rawValue))))
		}
	}

	func ApiRule_removeCondition(_ input: Operations.ApiRule_removeCondition.Input) async throws
		-> Operations.ApiRule_removeCondition.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }

		guard let ruleId = UUID(uuidString: input.path.ruleId) else {
			return #BasicBadRequest(
				msg: "Rule ID should be an UUID", code: ApiError.API10041)
		}

		guard let conditionId = UUID(uuidString: input.path.condId) else {
			return #BasicBadRequest(
				msg: "Condition ID should be an UUID", code: ApiError.API10042)
		}
		switch try await request.application.ruleService.deleteCondition(
			conditionId,
			forRule: ruleId, for: validGroupsIds)
		{
		case .deleted(let rule):
			return .ok(.init(body: .json(try .init(rule: rule))))
		case .notFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Condition not found",
							code: ApiError.API10043.rawValue))))
		}
	}

	func ApiRule_addLabel(_ input: Operations.ApiRule_addLabel.Input) async throws
		-> Operations.ApiRule_addLabel.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }

		guard let ruleId = UUID(uuidString: input.path.ruleId) else {
			return #BasicBadRequest(
				msg: "Rule ID should be an UUID", code: ApiError.API10044)
		}
		guard let labelId = UUID(uuidString: input.path.labelId) else {
			return #BasicBadRequest(
				msg: "Label ID should be an UUID", code: ApiError.API10045)
		}
		switch try await request.application.ruleService.addLabel(
			labelId: labelId, toRule: ruleId, for: validGroupsIds)
		{
		case .ok(let rule):
			return .ok(.init(body: .json(try .init(rule: rule))))
		case .notFound:
			return #BasicNotFound(
				msg: "Condition or label not found", code: ApiError.API10048)

		case .invalidOwnerId:
			return .conflict(
				.init(
					body: .json(
						.init(
							message:
								"The rule and the label should be in the same group owner Id",
							code: ApiError.API10049.rawValue))))
		}
	}

	func ApiRule_removeLabel(_ input: Operations.ApiRule_removeLabel.Input) async throws
		-> Operations.ApiRule_removeLabel.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }

		guard let ruleId = UUID(uuidString: input.path.ruleId) else {
			return #BasicBadRequest(
				msg: "Rule ID should be an UUID", code: ApiError.API10046)
		}
		guard let labelId = UUID(uuidString: input.path.labelId) else {
			return #BasicBadRequest(
				msg: "Label ID should be an UUID", code: ApiError.API10047)
		}
		let removeState = try await request.application.ruleService.removeLabel(
			labelId: labelId, fromRule: ruleId, for: validGroupsIds)
		switch removeState {
		case .ok(let rule):
			return .ok(.init(body: .json(try .init(rule: rule))))
		case .notFound:
			return #BasicNotFound(
				msg: "Rule not found", code: ApiError.API10050)
		}
	}
}

extension Components.Schemas.RuleInput: InputWithUserGroup, InputWithParentRule {}

extension Components.Schemas.Rule {
	init(rule: Rule) throws {
		id = try rule.requireID().uuidString
		groupOwnerId = rule.$groupOwner.id.uuidString
		name = rule.name
		conditions = try rule.conditions.map {
			try Components.Schemas.Rule.transformConditionToApi(condition: $0)
		}
		labelIds = try rule.labels.map { try $0.requireID().uuidString }
		relations = rule.conditionsRelation.toApi()
		parentRuleId = rule.$parent.id?.uuidString
	}
	static func transformConditionToApi(condition: Condition) throws
		-> Components.Schemas.Condition
	{
		switch condition.operation {
		case .prefix:
			return .ConditionString(
				.init(
					id: try condition.requireID().uuidString,
					operation: .prefix, value: try condition.getStr()))
		case .contains:
			return .ConditionString(
				.init(
					id: try condition.requireID().uuidString,
					operation: .contains, value: try condition.getStr()))
		case .suffix:
			return .ConditionString(
				.init(
					id: try condition.requireID().uuidString,
					operation: .suffix, value: try condition.getStr()))
		case .regularExpression:
			return .ConditionString(
				.init(
					id: try condition.requireID().uuidString,
					operation: .regularExpression, value: try condition.getStr()
				))
		case .greater:
			return .ConditionDouble(
				.init(
					id: try condition.requireID().uuidString,
					operation: .greater, value: try condition.getDouble()))
		case .greaterEqual:
			return .ConditionDouble(
				.init(
					id: try condition.requireID().uuidString,
					operation: .greaterEqual, value: try condition.getDouble()))
		case .lessEqual:
			return .ConditionDouble(
				.init(
					id: try condition.requireID().uuidString,
					operation: .lessEqual, value: try condition.getDouble()))
		case .less:
			return .ConditionDouble(
				.init(
					id: try condition.requireID().uuidString,
					operation: .less, value: try condition.getDouble()))
		}
	}
}

extension Components.Schemas.ConditionInput {
	func toBaseCondition() -> Rule.BaseCondition {
		switch self {
		case .ConditionDoubleInput(let condDouble):
			return .init(
				condDouble.operation.toInternal(),
				valueDouble: condDouble.value)
		case .ConditionStringInput(let condString):
			return .init(
				condString.operation.toInternal(),
				valueStr: condString.value)
		}
	}
}

extension Components.Schemas.OperationDouble {
	func toInternal() -> ConditionOperation {
		switch self {
		case .less:
			return .less
		case .lessEqual:
			return .lessEqual
		case .greaterEqual:
			return .greaterEqual
		case .greater:
			return .greater
		}
	}
}

extension Components.Schemas.OperationString {
	func toInternal() -> ConditionOperation {
		switch self {
		case .prefix:
			return .prefix
		case .contains:
			return .contains
		case .suffix:
			return .suffix
		case .regularExpression:
			return .regularExpression
		}
	}
}

extension Components.Schemas.ConditionalRelation {
	func toInternal() -> ConditionalRelationType {
		switch self {
		case .or:
			return .or
		case .notAnd:
			return .notAnd
		}
	}
}

extension ConditionalRelationType {
	func toApi() -> Components.Schemas.ConditionalRelation {
		switch self {
		case .or:
			return .or
		case .notAnd:
			return .notAnd
		}
	}
}
