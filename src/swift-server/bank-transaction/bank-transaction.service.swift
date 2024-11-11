import Fluent
import Vapor

class BankTransactionService: ServiceWithQueueAndDb {
	private let logger = Logger(label: "BankTransactionService")
	private let cursorHandler = CursorHandler<BankTransaction, String>(["date", "id"])

	func getActiveLabels(transactionsIds: [UUID]) async throws -> [UUID:
		[UUID]]
	{
		let labelsPivot = try await LabelTransaction.query(on: db).filter(
			\.$transaction.$id ~~ transactionsIds
		).filter(\.$linkReason != .manualDisabled).all()

		var grouping: [UUID: [UUID]] = [:]
		for transId in transactionsIds {
			grouping[transId] = []
		}
		for labelPivot in labelsPivot {
			grouping[labelPivot.$transaction.id]?.append(labelPivot.$label.id)
		}

		return grouping

	}

	func getAll(
		groupIds: [UUID], transactionIds: [UUID]? = nil,
		pageQuery: PageQuery = .init(),
		query: [String: Any] = [:]
	) async throws -> (ListWithCursor<BankTransaction>, [UUID: [UUID]]) {
		var query = BankTransaction.query(on: db)
			.filter(\.$groupOwner.$id ~~ groupIds)

		if let cursor = pageQuery.cursor {
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
			}
		}

		if let transactionIds = transactionIds {
			query = query.filter(\.$id ~~ transactionIds)
		}

		let data =
			try await query
			// .with(\.$labels)
			.sort(\.$_date, .descending)
			.sort(\.$id, .descending)
			.limit(pageQuery.limit)
			.all()

		let relations = try await getActiveLabels(
			transactionsIds: data.map { try $0.requireID() })

		return (
			pageQuery.getListWithCursor(
				data: data,
				generateCursor: {
					cursorHandler.stringify([
						"date": $0.date.toString(),
						"id": $0.id?.uuidString ?? "",
					])
				}), relations
		)

	}

	func existsSimilar(
		transaction: BankTransaction
	) async throws -> Bool {
		let similarCount = try await BankTransaction.query(on: db)
			.filter(\.$groupOwner.$id == transaction.$groupOwner.id)
			.filter(\.$_date == transaction.date.toString())
			.filter(\.$details == transaction.details)
			.filter(\.$kind == transaction.kind)
			.filter(\.$movementName == transaction.movementName)
			.filter(\.$value == transaction.value)
			.count()
		return similarCount > 0
	}

	func insertBatch(movements: [BankTransaction]) -> EventLoopFuture<Void> {
		return movements.create(on: db).map { _ in
			self.logger.info("Insert batch", metadata: ["sql": "Bulk insert"])
		}
	}

	func addTransaction(transaction: BankTransaction)
		async throws
		-> BankTransaction
	{
		try await transaction.create(on: db)
		try await queue.dispatch(
			NewTransactionJob.self,
			.init(
				id: transaction.id!, movementName: transaction.movementName,
				value: transaction.value, groupOwnerId: transaction.groupOwnerId))
		return transaction
	}

	enum LinkReturn {
		case ok
		case transactionNotFound
		case labelNotFound
		case groupIdsMismatch
	}

	func link(
		transaction transactionId: UUID, toLabel labelId: UUID,
		withValidGroups groupIds: [UUID]
	) async throws -> LinkReturn {
		let transaction = try await BankTransaction.query(on: db).filter(
			\.$id == transactionId
		).filter(\.$groupOwner.$id ~~ groupIds).first()
		guard let transaction = transaction else {
			return .transactionNotFound
		}

		let labelPivot = try await LabelTransaction.query(on: db).filter(
			\.$label.$id == labelId
		).filter(\.$transaction.$id == transactionId).first()
		if let labelPivot = labelPivot {
			if labelPivot.linkReason == .manualDisabled {
				labelPivot.linkReason = .manualEnabled
				try await labelPivot.save(on: db)
			}
			return .ok
		}

		let label = try await Label.query(on: db).filter(\.$id == labelId).filter(
			\.$groupOwner.$id ~~ groupIds
		).first()
		guard let label = label else {
			return .labelNotFound
		}

		if transaction.groupOwnerId != label.$groupOwner.id {
			return .groupIdsMismatch
		}

		try await transaction.$labels.attach(label, on: db) { pivot in
			pivot.linkReason = .manualEnabled
		}

		return .ok
	}

	enum UnlinkReturn {
		case ok
		case transactionNotFound
		case linkNotFound
	}

	func unlink(
		transaction transactionId: UUID, fromLabel labelId: UUID,
		withValidGroups groupIds: [UUID]
	) async throws -> UnlinkReturn {
		let transaction = try await BankTransaction.query(on: db).filter(
			\.$id == transactionId
		).filter(\.$groupOwner.$id ~~ groupIds).first()
		guard let _ = transaction else {
			return .transactionNotFound
		}

		let labelPivot = try await LabelTransaction.query(on: db).filter(
			\.$label.$id == labelId
		).filter(\.$transaction.$id == transactionId).first()
		if let labelPivot = labelPivot {
			if labelPivot.linkReason == .automatic {
				labelPivot.linkReason = .manualDisabled
				try await labelPivot.save(on: db)
				return .ok
			} else {
				try await labelPivot.delete(on: db)
			}
		}
		return .linkNotFound
	}
	enum setCommentReturn {
		case ok
		case notFound
	}

	func setComment(
		for transactionId: UUID, andComment comment: String?,
		withValidGroups groupIds: [UUID]
	) async throws -> setCommentReturn {
		let transaction = try await BankTransaction.query(on: db).filter(
			\.$id == transactionId
		).filter(\.$groupOwner.$id ~~ groupIds).first()
		guard let transaction = transaction else {
			return .notFound
		}

		transaction.description = comment
		try await transaction.save(on: db)
		return .ok

	}
}
