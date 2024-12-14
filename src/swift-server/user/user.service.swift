import Fluent
import Vapor

class UserService: ServiceWithDb {
	private let cursorHandler = CursorHandler<User, String>(["id"])
	struct NewUser {
		var username: String
		var password: String
		var email: String
		var firstName: String?
		var lastName: String?
		var isActive: Bool
		var isAdmin: Bool
	}
	func create(user userData: NewUser, groupName: String) async throws -> (User, UserGroup) {
		let group = UserGroup(name: groupName)

		try await group.save(on: db)

		// Todo: validate that e-mail or username are not in the DB, and return an error
		let user = try User(
			username: userData.username, email: userData.email, firstName: userData.firstName,
			lastName: userData.lastName, isActive: userData.isActive,
			isAdmin: userData.isAdmin, defaultGroupId: group.requireID())
		try user.setPassword(pwd: userData.password)
		try await user.save(on: db)
		try await user.$groups.attach(group, on: db)
		try await user.$groups.load(on: db)
		return (user, group)
	}

	func getUsersPage(pageQuery: PageQuery) async throws -> ListWithCursor<
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
		userId: UUID, userData: User,
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

class UserGroupService: ServiceWithDb {

	func validateGroupId(groupId: String, forUserId userId: UUID) async throws
		-> UUID?
	{
		guard let groupId = UUID(uuidString: groupId) else {
			return nil
		}
		if try await validateGroupId(groupId: groupId, forUserId: userId) {
			return groupId
		} else {
			return nil
		}
	}
	func validateGroupId(groupId: UUID, forUserId userId: UUID) async throws
		-> Bool
	{
		let existsRelation = try await UserGroupPivot.query(on: db).filter(
			\.$group.$id == groupId
		).filter(\.$user.$id == userId).count()

		return existsRelation > 0
	}
}
