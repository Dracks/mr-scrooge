import Foundation
import Queues
import Vapor

struct TransactionSummary: Codable {
	var id: UUID
	var movementName: String
	var value: Double
	var groupOwnerId: UUID
}

final class NewTransactionJob: AsyncJob {
	typealias Payload = TransactionSummary

	func dequeue(_ context: QueueContext, _ payload: TransactionSummary) async throws {
		context.logger.info("Processing rules for \(payload.id)")

		try await context.application.ruleService.ruleEngine.applyRules(
			on: context.application.db, for: payload)
	}

	func error(_ context: QueueContext, _ error: Error, _ payload: TransactionSummary)
		async throws
	{
		context.logger.error(
			"Some error happened processing \(payload.id) transaction",
			metadata: ["error": "\(String(reflecting: error))"])
	}
}
