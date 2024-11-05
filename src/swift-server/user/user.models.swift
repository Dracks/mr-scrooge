import Fluent
import Vapor

final class User: Model, Content, @unchecked Sendable {
	static let schema = "users"

	@ID(key: .id)
	var id: UUID?

	@Field(key: "username")
	var username: String

	@Field(key: "password_hash")
	var passwordHash: String

	@Field(key: "email")
	var email: String

	@Field(key: "first_name")
	var firstName: String?

	@Field(key: "last_name")
	var lastName: String?

	@Field(key: "is_active")
	var isActive: Bool

	@Field(key: "is_superuser")
	var isAdmin: Bool

	@Siblings(through: UserGroupPivot.self, from: \.$user, to: \.$group)
	var groups: [UserGroup]

	@Parent(key: "default_group_id")
	var defaultGroup: UserGroup

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	init() {}

	init(
		id: UUID? = nil, username: String, passwordHash: String = "", email: String = "",
		firstName: String? = nil, lastName: String? = nil, isActive: Bool = true,
		isAdmin: Bool = false, defaultGroupId: UserGroup.IDValue
	) {
		self.id = id
		self.username = username
		self.passwordHash = passwordHash
		self.email = email
		self.firstName = firstName
		self.lastName = lastName
		self.isActive = isActive
		self.isAdmin = isAdmin
		self.$defaultGroup.id = defaultGroupId
	}

	func setPassword(pwd: String) throws {
		self.passwordHash = try Bcrypt.hash(pwd)
	}

	func verifyPassword(pwd: String) -> Bool {
		do {
			return try Bcrypt.verify(pwd, created: self.passwordHash)
		} catch {
			return false
		}
	}

	func getGroupsIds(on db: Database) async throws -> [UserGroup.IDValue] {
		return try await self.$groups.get(on: db).map { try $0.requireID() }
	}
}

extension User: SessionAuthenticatable {
	typealias SessionID = UUID
	var sessionID: SessionID {
		self.id!
	}
}

final class UserGroup: Model, Content, @unchecked Sendable {
	static let schema = "user_groups"

	@ID(key: .id)
	var id: UUID?

	@Field(key: "name")
	var name: String

	@Siblings(through: UserGroupPivot.self, from: \.$group, to: \.$user)
	var users: [User]

	@Timestamp(key: "created_at", on: .create)
	var createdAt: Date?

	@Timestamp(key: "updated_at", on: .update)
	var updatedAt: Date?

	init() {}

	init(id: UUID? = nil, name: String) {
		self.id = id
		self.name = name
	}
}

final class UserGroupPivot: Model, @unchecked Sendable {
	static let schema = "user_group_pivot"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "user_id")
	var user: User

	@Parent(key: "group_id")
	var group: UserGroup

	init() {}

	init(userId: User.IDValue, groupId: UserGroup.IDValue) {
		self.$user.id = userId
		self.$group.id = groupId
	}
}
