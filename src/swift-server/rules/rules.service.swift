import Fluent
import Foundation
import Vapor

class RuleService: ServiceWithDb {
	struct RuleParam {
		let groupOwnerId: UUID
		let name: String
		let relations: ConditionalRelationType
		let parentId: UUID?
	}
	let ruleEngine = RuleEngine()
	private let cursorHandler = CursorHandler<Rule, String>(["id"])

	func getAll(groupIds: [UUID], pageQuery: PageQuery) async throws
		-> ListWithCursor<Rule>
	{
		var query = Rule.query(on: db).filter(\.$groupOwner.$id ~~ groupIds)
		if let cursor = pageQuery.cursor {
			let cursorData = try self.cursorHandler.parse(cursor)
			if let idString = cursorData["id"], let id = UUID(uuidString: idString) {
				query = query.filter(\.$id < id)
			}
		}

		let data = try await query.with(\.$conditions).with(\.$labels).sort(
			\.$id, .descending
		).limit(pageQuery.limit).all()
		return pageQuery.getListWithCursor(
			data: data,
			generateCursor: {
				cursorHandler.stringify(["id": $0.id?.uuidString ?? ""])
			})
	}

	func create(rule: RuleParam) async throws -> Rule {
		let newRule = Rule(
			groupOwnerId: rule.groupOwnerId, name: rule.name,
			conditionsRelation: rule.relations, parentId: rule.parentId)
		try await newRule.save(on: db)
		try await newRule.$children.load(on: db)
		try await newRule.$conditions.load(on: db)
		try await newRule.$labels.load(on: db)
		return newRule
	}

	enum UpdateRuleState {
		case ok(rule: Rule)
		case notFound
	}

	func updateRule(withId ruleId: UUID, rule inputRule: RuleParam, for validGroupsIds: [UUID])
		async throws -> UpdateRuleState
	{
		let rule = try await Rule.query(on: db).filter(
			\.$groupOwner.$id ~~ validGroupsIds
		).filter(\.$id == ruleId).first()
		guard let rule else {
			return .notFound
		}
		rule.name = inputRule.name
		rule.conditionsRelation = inputRule.relations
		rule.$groupOwner.id = inputRule.groupOwnerId
		rule.$parent.id = inputRule.parentId
		try await rule.save(on: db)
		try await rule.$children.load(on: db)
		try await rule.$conditions.load(on: db)
		try await rule.$labels.load(on: db)
		return .ok(rule: rule)
	}

	enum DeleteRuleState {
		case ok
		case notFound
		case hasChildren(childrenIds: [UUID])
	}
	func deleteRule(withId ruleId: UUID, for validGroupsIds: [UUID]) async throws
		-> DeleteRuleState
	{
		try await db.transaction { database in
			let rule = try await Rule.query(on: database).filter(
				\.$groupOwner.$id ~~ validGroupsIds
			).filter(\.$id == ruleId).with(\.$children).first()
			guard let rule else {
				return .notFound
			}
			if !rule.children.isEmpty {
				return .hasChildren(
					childrenIds: try rule.children.map { try $0.requireID() })
			}
			try await Condition.query(on: database).filter(\.$rule.$id == ruleId)
				.delete()
			let ruleLabelQuery = RuleLabelAction.query(on: database).filter(
				\.$rule.$id == ruleId)
			let ruleLabelActions = try await ruleLabelQuery.with(\.$transactionPivot)
				.all()
			for ruleLabelAction in ruleLabelActions {
				try await RuleService.removeLabelActionPivot(
					labelAction: ruleLabelAction, on: database)
			}
			try await ruleLabelQuery.delete()
			try await rule.delete(on: database)
			return .ok
		}

	}

	enum AddCodingState {
		case ok(rule: Rule)
		case notFound
	}

	func addCondition(
		condition: Rule.BaseCondition, forRule ruleId: UUID, for validGroupsIds: [UUID]
	) async throws -> AddCodingState {
		let rule = try await Rule.query(on: db).filter(
			\.$groupOwner.$id ~~ validGroupsIds
		).filter(\.$id == ruleId).with(\.$children).first()
		guard let rule else {
			return .notFound
		}

		try await rule.$conditions.create(
			.init(condition, for: try rule.requireID()), on: db)
		try await rule.$conditions.load(on: db)
		try await rule.$labels.load(on: db)
		return .ok(rule: rule)
	}

	func updateCondition(
		_ condId: UUID, condition updatedCondition: Rule.BaseCondition,
		forRule ruleId: UUID,
		for validGroupsIds: [UUID]
	) async throws -> AddCodingState {
		let rule = try await Rule.query(on: db).filter(
			\.$groupOwner.$id ~~ validGroupsIds
		).filter(\.$id == ruleId).with(\.$children).first()
		guard let rule else {
			return .notFound
		}

		let condition = try await Condition.query(on: db).filter(\.$id == condId).filter(
			\.$rule.$id == ruleId
		).first()

		guard let condition else {
			return .notFound
		}
		condition.operation = updatedCondition.operation
		condition.valueStr = updatedCondition.valueStr
		condition.valueDouble = updatedCondition.valueDouble
		try await condition.save(on: db)

		try await rule.$conditions.load(on: db)
		try await rule.$labels.load(on: db)
		return .ok(rule: rule)
	}

	enum DeleteConditionState {
		case deleted(rule: Rule)
		case notFound
	}

	func deleteCondition(
		_ condId: UUID,
		forRule ruleId: UUID,
		for validGroupsIds: [UUID]
	) async throws -> DeleteConditionState {
		let rule = try await Rule.query(on: db).filter(
			\.$groupOwner.$id ~~ validGroupsIds
		).filter(\.$id == ruleId).with(\.$children).first()
		guard let rule else {
			return .notFound
		}

		let condition = try await Condition.query(on: db).filter(\.$id == condId).filter(
			\.$rule.$id == ruleId
		).first()

		guard let condition else {
			return .notFound
		}
		try await condition.delete(on: db)

		try await rule.$conditions.load(on: db)
		try await rule.$labels.load(on: db)
		return .deleted(rule: rule)
	}
	enum AddLabelState {
		case ok(rule: Rule)
		case notFound
		case invalidOwnerId
	}

	func addLabel(
		labelId: UUID,
		toRule ruleId: UUID,
		for validGroupsIds: [UUID]
	) async throws -> AddLabelState {
		let rule = try await Rule.query(on: db).filter(
			\.$groupOwner.$id ~~ validGroupsIds
		).filter(\.$id == ruleId).first()
		guard let rule else {
			return .notFound
		}

		let label = try await Label.query(on: db).filter(\.$id == labelId).first()
		guard let label else {
			return .notFound
		}

		if rule.$groupOwner.id != label.$groupOwner.id {
			return .invalidOwnerId
		}

		let labelAttached = try await rule.$labels.isAttached(to: label, on: db)
		if !labelAttached {
			try await rule.$labels.attach(label, on: db)
		}

		try await rule.$conditions.load(on: db)
		try await rule.$labels.load(on: db)
		return .ok(rule: rule)
	}

	enum RemoveLabelState {
		case ok(rule: Rule)
		case notFound
	}

	func removeLabel(
		labelId: UUID,
		fromRule ruleId: UUID,
		for validGroupsIds: [UUID]
	) async throws -> RemoveLabelState {
		try await db.transaction { database in
			let rule = try await Rule.query(on: database).filter(
				\.$groupOwner.$id ~~ validGroupsIds
			).filter(\.$id == ruleId).first()
			guard let rule else {
				return .notFound
			}

			let labelAction = try await RuleLabelAction.query(on: database)
				.filter(\.$rule.$id == ruleId)
				.filter(\.$label.$id == labelId)
				.with(\.$transactionPivot)
				.first()

			if let labelAction {
				try await RuleService.removeLabelActionPivot(
					labelAction: labelAction, on: database)
				try await labelAction.delete(on: database)
			}

			try await rule.$conditions.load(on: database)
			try await rule.$labels.load(on: database)
			return .ok(rule: rule)
		}
	}
}

extension RuleService {
	private static func removeLabelActionPivot(labelAction: RuleLabelAction, on db: Database)
		async throws
	{
		for labelTransaction in labelAction.transactionPivot {
			labelTransaction.linkReason = .manualEnabled
			try await labelTransaction.save(on: db)
		}
		try await labelAction.$transactionPivot.detachAll(on: db)
	}
}
