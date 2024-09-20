import Fluent
import Foundation
import Vapor

struct ProfileController: RouteCollection {
	let usersService = UsersService()

	struct UpdateProfile: Content {
		let username: String?
		let email: String?
		let firstName: String?
		let lastName: String?
	}

	struct GetProfile: Content {
		let id: UUID
		let username: String
		let email: String
		let firstName: String?
		let lastName: String?
		let isActive: Bool
		let isAdmin: Bool
		let groups: [UserGroupResponse]
		let defaultGroupId: UserGroup.IDValue

		init(from user: User) {
			self.id = user.id!
			self.username = user.username
			self.email = user.email
			self.firstName = user.firstName
			self.lastName = user.lastName
			self.isActive = user.isActive
			self.isAdmin = user.isAdmin
			self.groups = user.groups.map {
				UserGroupResponse(id: $0.id!, name: $0.name)
			}
			self.defaultGroupId = user.defaultGroup.id!
		}
	}

	struct UserGroupResponse: Content {
		let id: UUID
		let name: String
	}

	struct GetProfiles: Content {
		let results: [GetProfile]
		let next: String?
	}

	struct DeleteProfile: Content {
		let ok: Bool
	}

	func boot(routes: RoutesBuilder) throws {
		let profiles = routes.grouped(UserIdentifiedMiddleware()).grouped("profile")
		profiles.get(use: getProfile)
		profiles.put(use: updateProfile)
		profiles.get("all", use: getProfiles)
		profiles.delete(":id", use: deleteProfile)
	}

	func getProfile(req: Request) async throws -> GetProfile {
		let user = try await getUser(fromRequest: req)
		return GetProfile(from: user)
	}

	func updateProfile(req: Request) async throws -> GetProfile {
		let update = try req.content.decode(UpdateProfile.self)
		let user = try await getUser(fromRequest: req)

		if let username = update.username {
			user.username = username
		}
		if let email = update.email {
			user.email = email
		}
		if let firstName = update.firstName {
			user.firstName = firstName
		}
		if let lastName = update.lastName {
			user.lastName = lastName
		}

		try await user.save(on: req.db)

		return GetProfile(from: user)
	}

	func getProfiles(req: Request) async throws -> GetProfiles {
		let user = try await getUser(fromRequest: req)
		guard user.isAdmin else {
			throw Abort(.unauthorized)
		}

		let users = try await User.query(on: req.db).all()
		let data = users.map { user in
			return GetProfile(from: user)
		}

		return GetProfiles(results: data, next: nil)
	}

	func deleteProfile(req: Request) async throws -> DeleteProfile {
		let userId = req.parameters.get("id", as: UUID.self)
		guard let userId = userId else {
			throw Abort(.badRequest)
		}
		let requestingUser = try await getUser(fromRequest: req)
		guard requestingUser.isAdmin else {
			throw Abort(.unauthorized)
		}
		let userToDelete = try await User.find(userId, on: req.db)
		guard let userToDelete = userToDelete else {
			throw Abort(.notFound)
		}
		try await userToDelete.delete(on: req.db)

		return DeleteProfile(ok: true)
	}
}
