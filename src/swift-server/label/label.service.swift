import Fluent
import Vapor

final class LabelService: ServiceWithDb, @unchecked Sendable {
	private let cursorHandler = CursorHandler<Label, String>(["id"])
	func createLabel(label: Label) async throws -> Label {
		try await label.save(on: db)
		try await label.$groupOwner.load(on: db)
		return label
	}

	func getAll(pageQuery: PageQuery = .init(), groupIds: [UUID]) async throws
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

	enum UpdateLabelReturn {
		case ok(label: Label)
		case notFound
	}

	func updateLabel(
		withId labelId: UUID, data: Components.Schemas.UpdateLabel, forUser user: User
	) async throws -> UpdateLabelReturn {
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		let label = try await Label.query(on: db).filter(\.$id == labelId).filter(
			\.$groupOwner.$id ~~ validGroupsIds
		).first()
		guard let label else {
			return .notFound
		}
		label.name = data.name
		try await label.save(on: db)
		return .ok(label: label)
	}

	enum DeleteLabelReturn {
		case ok
		case notFound
	}

	func deleteLabel(withId labelId: UUID, forUser user: User) async throws -> DeleteLabelReturn
	{
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		let label = try await Label.query(on: db).filter(\.$id == labelId).filter(
			\.$groupOwner.$id ~~ validGroupsIds
		).first()
		guard let label else {
			return .notFound
		}
		#warning("We should check and delete all references of this label")
		try await label.delete(on: db)
		return .ok
	}
}
