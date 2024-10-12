import Fluent
import Vapor

class UserService {
	private let cursorHandler = CursorHandler<User, String>(["id"])

	func getUsersPage(on db: Database, pageQuery: PageQuery) async throws -> ListWithCursor<
		User
	> {
		var query = User.query(on: db).with(\.$groups)

		if let cursor = pageQuery.cursor {
			let cursorData = try self.cursorHandler.parse(cursor)
			if let idString = cursorData["id"], let id = UUID(uuidString: idString) {
				query.filter(\.$id < id)
			}
		}

		let data = try await query.sort(\.$id, .descending).limit(pageQuery.limit).all()

		return pageQuery.getListWithCursor(
			data: data,
			generateCursor: {
				cursorHandler.stringify(["id": $0.id?.uuidString ?? ""])
			})
	}
}

class UserGroupService {

}
