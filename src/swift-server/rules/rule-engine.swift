import Fluent
import Foundation

class CompiledRule {
	let id: UUID
	let parent: UUID?
	var children: [CompiledRule]
	let conditions: [(_ transaction: TransactionSummary) -> Bool]
	let ruleLabels: [RuleLabelAction]
	let conditionsRelation: ConditionalRelationType

	init(_ rule: Rule) throws {
		id = try rule.requireID()
		parent = rule.$parent.id
		children = []
		ruleLabels = rule.labelPivots
		conditions = try rule.conditions.map { try $0.toClousure() }
		conditionsRelation = rule.conditionsRelation
	}

	func checkConditionals(for transaction: TransactionSummary)
		-> Bool
	{
		switch conditionsRelation {
		case .or:
			return conditions.contains { $0(transaction) }
		case .notAnd:
			return conditions.map { $0(transaction) }.filter { $0 }.isEmpty
		}
	}
}

class RuleEngine {
	var cache: Cache<UUID, [CompiledRule]> = .init(entryLifetime: 10)

	private func compileRules(on db: Database, forGroup groupOwnerId: UUID) async throws
		-> [CompiledRule]
	{
		let dbRules = try await Rule.query(on: db).filter(
			\.$groupOwner.$id == groupOwnerId
		).with(\.$conditions).with(\.$labelPivots).all()
		let rules = try dbRules.map { try CompiledRule($0) }
		let rulesHash: [UUID: CompiledRule] = rules.reduce(into: [UUID: CompiledRule]()) {
			$0[$1.id] = $1
		}
		try rules.filter { $0.parent != nil }.forEach { rule in
			// We are already filtering for rules with parent
			let parentId = rule.parent!
			guard let parent = rulesHash[parentId] else {
				throw Exception(
					.E10016, context: ["id": rule.id, "parentId": parentId])
			}

			parent.children.append(rule)
		}

		return rules.filter { $0.parent == nil }
	}

	private func retrieveRules(on db: Database, forGroup groupOwnerId: UUID) async throws
		-> [CompiledRule]
	{
		let cachedData = cache[groupOwnerId]
		guard let cachedData else {
			let compiledData = try await compileRules(on: db, forGroup: groupOwnerId)
			cache[groupOwnerId] = compiledData
			return compiledData
		}
		return cachedData
	}

	private func applyLabels(
		on db: Database, ruleId: UUID, ruleLabels: [RuleLabelAction],
		for transaction: TransactionSummary
	) async throws {
		for labelAction in ruleLabels {
			let labelId = labelAction.$id.$label.id
			var labelTransaction = try await LabelTransaction.query(on: db)
				.filter(\.$id.$transaction.$id == transaction.id)
				.filter(\.$id.$label.$id == labelId)
				.first()

			if labelTransaction == nil {
				let _labelTransaction = LabelTransaction(
					labelId: labelId,
					transactionId: transaction.id,
					linkReason: .automatic)
				try await _labelTransaction.save(on: db)
				labelTransaction = _labelTransaction
			}
			if labelTransaction?.linkReason == .automatic {
				try await RuleLabelPivot(
					ruleId: ruleId, labelId: labelId,
					transactionId: transaction.id
				).save(on: db)
			}
		}
	}

	private func checkAndApply(
		on db: Database, rules: [CompiledRule], for transaction: TransactionSummary
	) async throws {
		for rule in rules {
			if rule.checkConditionals(for: transaction) {
				try await applyLabels(
					on: db, ruleId: rule.id, ruleLabels: rule.ruleLabels,
					for: transaction)
				try await checkAndApply(
					on: db, rules: rule.children, for: transaction)
			}
		}
	}

	func applyRules(on db: Database, for transaction: TransactionSummary) async throws {
		let rules = try await retrieveRules(on: db, forGroup: transaction.groupOwnerId)
		try await checkAndApply(on: db, rules: rules, for: transaction)
	}
}
