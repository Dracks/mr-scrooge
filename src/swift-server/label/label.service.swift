import Fluent
import Vapor

struct LabelService {
	private let cursorHandler = CursorHandler<Label, String>(["id"])
	func createLabel(on db: Database, label: Label) async throws -> Label {
		try await label.save(on: db)
		try await label.$groupOwner.load(on: db)
		return label
	}
	/*
	func addTransaction(req: Request, labelTransaction: LabelTransaction) async throws
		-> LabelTransaction
	{
		try await labelTransaction.save(on: req.db)
		return labelTransaction
	}
*/
	func getAll(on db: Database, pageQuery: PageQuery = .init(), groupIds: [UUID]) async throws
		-> ListWithCursor<Label>
	{
		var query = Label.query(on: db)
			.filter(\.$groupOwner.$id ~~ groupIds)

		if let cursor = pageQuery.cursor {
			let cursorData = try self.cursorHandler.parse(cursor)
			if let idString = cursorData["id"], let id = UUID(uuidString: idString) {
				query = query.filter(\.$id < id)
			}
		}

		let data =
			try await query
			.sort(\.$id, .descending)
			.limit(pageQuery.limit)
			.with(\.$groupOwner)
			.all()

		return pageQuery.getListWithCursor(data: data) { last in
			self.cursorHandler.stringify(["id": last.id!.uuidString])
		}
	}
	/*
	func getLabelsIdForTransaction(req: Request, transactionId: UUID) async throws -> [UUID] {
		let labelTransactions = try await LabelTransaction.query(on: req.db)
			.filter(\.$transaction.$id == transactionId)
			.all()

		return labelTransactions.map { $0.$label.id }
	}
 */
}
