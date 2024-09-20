import Fluent
import OpenAPIVapor
import Vapor

extension MrScroogeAPIImpl {

	func ApiSession_login(_ input: Operations.ApiSession_login.Input) async throws
		-> Operations.ApiSession_login.Output
	{
		var credentials: Components.Schemas.UserCredentials
		switch input.body {
		case let .json(body):
			credentials = body
		}
		let req = request
		let user = try await User.query(on: req.db)
			.filter(\.$username == credentials.username)
			.first()

		if let user = user, user.verifyPassword(pwd: credentials.password) {
			req.auth.login(user)
			try await user.$groups.load(on: req.db)
			try await user.$defaultGroup.load(on: req.db)

			return .ok(.init(body: .json(.init(from: user))))
		}

		return .unauthorized(
			.init(body: .json(.init(details: "User or passwrod not valid"))))
	}

	func ApiSession_me(_ input: Operations.ApiSession_me.Input) async throws
		-> Operations.ApiSession_me.Output
	{
		do {
			let req = request
			let user = try await getUser(fromRequest: req)
			try await user.$groups.load(on: req.db)
			try await user.$defaultGroup.load(on: req.db)
			// return ProfileController.GetProfile(from: user)
			return .ok(
				.init(
					body: .json(
						.identified(
							.init(
								user: .identified,
								profile: .init(from: user))))))
		} catch is NotIdentifiedError {
			return .ok(.init(body: .json(.anonymous(.init(user: .anonymous)))))
		}
	}

	func ApiSession_logout(_ input: Operations.ApiSession_logout.Input) async throws
		-> Operations.ApiSession_logout.Output
	{
		request.auth.logout(User.self)
		return .ok(.init(body: .json(true)))
	}
}

extension Components.Schemas.UserProfile {
	init(from user: User) {
		self.id = user.id!.uuidString
		self.username = user.username
		self.email = user.email
		self.firstName = user.firstName
		self.lastName = user.lastName
		self.isActive = user.isActive
		self.isAdmin = user.isAdmin
		self.groups = user.groups.map {
			Components.Schemas.UserGroup(id: $0.id!.uuidString, name: $0.name)
		}
		self.defaultGroupId = user.defaultGroup.id!.uuidString
	}
}
