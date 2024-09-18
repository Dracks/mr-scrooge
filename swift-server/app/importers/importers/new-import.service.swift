import Fluent
import Foundation
import Vapor

protocol ParserFactory {
	func create(filePath: String) -> AsyncThrowingStream<PartialBankTransaction, Error>
	var fileRegex: String { get }
	var key: String { get }
}

struct PartialBankTransaction {
	var movementName: String
	var date: DateOnly
	var dateValue: DateOnly?
	var details: String?
	var value: Double
	var description: String?

	func toBankTransaction(kind: String, groupOwnerId: UUID) -> BankTransaction {
		return BankTransaction(
			groupOwnerId: groupOwnerId,
			movementName: movementName,
			date: date,
			dateValue: dateValue,
			details: details,
			value: value,
			kind: kind,
			description: description
		)
	}
}

class NewImportService {
	private var parsersMap: [String: ParserFactory]
	private let bankTransactionService: BankTransactionService

	init(parsers: [ParserFactory]) {
		self.parsersMap = Dictionary(uniqueKeysWithValues: parsers.map { ($0.key, $0) })
		self.bankTransactionService = BankTransactionService()
	}

	func getParsers() -> [ParserFactory] {
		return Array(parsersMap.values)
	}

	func generateStatusTransaction(status: StatusReport, transaction: PartialBankTransaction)
		-> StatusReportRow
	{
		return StatusReportRow(
			reportId: status.id!,
			movementName: transaction.movementName,
			date: transaction.date,
			dateValue: transaction.dateValue,
			details: transaction.details,
			value: transaction.value,
			description: transaction.description
		)
	}

	func importFromFile(
		on db: Database, groupOwnerId: UUID, key: String, fileName: String, filePath: String
	) async throws {
		let status = StatusReport(
			description: "",
			fileName: fileName,
			groupOwnerId: groupOwnerId,
			kind: key,
			status: .ok
		)
		try await status.create(on: db)

		do {
			guard let parser = parsersMap[key] else {
				throw Exception(.E10000, context: ["parserKey": key])
			}

			let source = parser.create(filePath: filePath)
			var discarting = true
			var previous: BankTransaction?
			var previousState: StatusReportRow?

			for try await partialTransaction in source {
				let transaction = partialTransaction.toBankTransaction(
					kind: key, groupOwnerId: groupOwnerId)
				let statusTransaction = generateStatusTransaction(
					status: status, transaction: partialTransaction)

				if try await bankTransactionService.existsSimilar(
					on: db, transaction: transaction)
				{
					if discarting {
						let msg = "repeated row, not inserted"
						status.status = .warn
						statusTransaction.message = msg
						if let previousStateValidated = previousState {
                            // Todo some test is not passing here.
							previousStateValidated.message = msg
							try await previousStateValidated.save(
								on: db)
							previousState = nil
						}
						try await statusTransaction.save(on: db)
					} else {
						previous = transaction
						previousState = statusTransaction
						discarting = true
					}
				} else {
					if let previousValidated = previous,
						let previousStateValidated = previousState
					{
						let record =
							try await bankTransactionService
							.addTransaction(
								on: db,
								transaction: previousValidated)
						previousStateValidated.message =
							"Repeated row, but inserted"
						previousStateValidated.transactionId =
							try record.requireID()
						try await previousStateValidated.save(on: db)
						previous = nil
						previousState = nil
					}
					discarting = false
					let record =
						try await bankTransactionService.addTransaction(
							on: db, transaction: transaction

						)
					statusTransaction.transactionId = record.id
					try await statusTransaction.save(on: db)
				}
			}
		} catch {
			// print(error)
			status.description = String(describing: error)
			// status.stack = String(describing: error)
			if let error = error as? Exception {
				let jsonData = try JSONSerialization.data(
					withJSONObject: error.allContext, options: [])
				status.context = String(data: jsonData, encoding: .utf8)
			}
			status.status = .error
			try await status.save(on: db)
		}

		try await status.save(on: db)
	}
}
