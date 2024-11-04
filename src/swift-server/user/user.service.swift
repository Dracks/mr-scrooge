import Fluent
import Vapor

class UserService {
	private let cursorHandler = CursorHandler<User, String>(["id"])

	func getUsersPage(on db: Database, pageQuery: PageQuery) async throws -> ListWithCursor<
		User
	> {
		let query = User.query(on: db).with(\.$groups)

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

	enum updateUserReturn {
		case notFound
		case ok(user: User)
	}

	func updateUser(
		on db: Database, userId: UUID, userData: User,
		andPassword newPassword: String? = nil
	) async throws
		-> updateUserReturn
	{
		let user = try await User.query(on: db).filter(\.$id == userId).first()
		guard let user = user else {
			return .notFound
		}

		userData.id = user.id
		userData._$idExists = true

		if let newPassword, !newPassword.isEmpty {
			try userData.setPassword(pwd: newPassword)
		} else {
			userData.passwordHash = user.passwordHash
		}

		try await userData.save(on: db)
		return .ok(user: userData)
	}
}

class UserGroupService {
	func validateGroupId(on db: Database, groupId: String, forUserId userId: UUID) async throws
		-> UUID?
	{
		guard let groupId = UUID(uuidString: groupId) else {
			return nil
		}
		if try await validateGroupId(on: db, groupId: groupId, forUserId: userId) {
			return groupId
		} else {
			return nil
		}
	}
	func validateGroupId(on db: Database, groupId: UUID, forUserId userId: UUID) async throws
		-> Bool
	{
		let existsRelation = try await UserGroupPivot.query(on: db).filter(
			\.$group.$id == groupId
		).filter(\.$user.$id == userId).count()

		return existsRelation > 0
	}
}
