import Fluent

class RulesService {
	func applyRules(on db: Database, for transaction: TransactionSummary) async throws {
		let rules = try await Rule.query(on: db).filter(
			\.$groupOwner.$id == transaction.groupOwnerId
		).with(\.$conditions).all()
		for rule in rules {
			let isMatch = try await rule.checkConditionals(on: db, for: transaction)
			if isMatch {
				try await rule.$labels.load(on: db)
				for label in rule.labels {
					let labelTransaction = LabelTransaction(
						labelId: label.id!, transactionId: transaction.id,
						linkReason: .automatic)
					try await labelTransaction.save(on: db)
					try await RuleLabelPivot(
						ruleId: rule.id!,
						labelTransactionId: labelTransaction.id!
					).save(on: db)
				}
				// rules.extends(rule.children)
			}
		}
	}
}
let rulesService = RulesService()
