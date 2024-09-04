import Fluent
import Vapor

struct ListWithCursor<T: Content> {
	let list: [T]
	let next: String?
}

class BankTransactionService {
	private let logger = Logger(label: "BankTransactionService")
	private let cursorHandler = CursorHandler<BankTransaction, String>(["date", "id"])

	init() {}

	func getAll(
		on db: Database, groupIds: [UUID], cursor: String? = nil, limit: Int = 100,
		query: [String: Any] = [:]
	) async throws -> ListWithCursor<BankTransaction> {
		var query = BankTransaction.query(on: db)
			.filter(\.$groupOwner.$id ~~ groupIds)

		if let cursor = cursor {
			let cursorData = try self.cursorHandler.parse(cursor)
			if let dateString = cursorData["date"], let date = DateOnly(dateString),
				let idString = cursorData["id"], let id = UUID(uuidString: idString)
			{
				query = query.group(.or) { group in
					group.group(.and) { subGroup in
						subGroup.filter(\.$_date == date.toString())
							.filter(\.$id < id)
					}
					group.filter(\.$_date < date.toString())
				}
				print(query)
			}
		}

		let data =
			try await query
			.with(\.$labels)
			.sort(\.$_date, .descending)
			.sort(\.$id, .descending)
			.limit(limit)
			.all()

		let hasMore = data.count >= limit
		let cursorElement = hasMore ? data.last : nil
		let nextCursor = cursorElement.map {
			self.cursorHandler.stringify([
				"date": $0.date.toString(),
				"id": $0.id?.uuidString ?? "",
			])
		}
		return ListWithCursor(
			list: data,
			next: nextCursor
		)

	}

	func existsSimilar(
		on db: Database, transaction: BankTransaction
	) async throws -> Bool {
		let count = try await BankTransaction.query(on: db)
            .filter(\.$groupOwner.$id == transaction.groupOwnerId)
			.filter(\.$_date == transaction.date.toString())
			.filter(\.$details == transaction.details)
            .filter(\.$kind == transaction.kind)
			.filter(\.$movementName == transaction.movementName)
			.filter(\.$value == transaction.value)
			.count()
        return count > 0
	}

	func insertBatch(on db: Database, movements: [BankTransaction]) -> EventLoopFuture<Void> {
		return movements.create(on: db).map { _ in
			self.logger.info("Insert batch", metadata: ["sql": "Bulk insert"])
		}
	}

	func addTransaction(on db: Database, transaction: BankTransaction)async throws -> BankTransaction {
        try await transaction.create(on: db)
        return transaction
    }
}

// Helper extension
extension Array {
	subscript(safe index: Index) -> Element? {
		return indices.contains(index) ? self[index] : nil
	}
}
