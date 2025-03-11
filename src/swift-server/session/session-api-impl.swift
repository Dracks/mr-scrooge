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
		let cleanupDate = Date(
			timeIntervalSinceNow: -EnvConfig.shared.maxLoginAttemptsTimePeriod)
		try await UserLoginAttempt.query(on: request.db)
			.filter(\.$timestamp < cleanupDate).delete()
		try await UserLoginAttempt(username: credentials.username).save(on: request.db)
		let onUnauthorizedLatency = EnvConfig.shared.latencyOnInvalidPassword
		let loginAttemptsCount = try await UserLoginAttempt.query(on: request.db).filter(
			\.$username == credentials.username
		).count()

		guard
			loginAttemptsCount <= EnvConfig.shared.maxLoginAttempts
		else {
			try await Task.sleep(for: .seconds(onUnauthorizedLatency))
			request.application.logger.info(
				"User \"\(credentials.username)\" unauthorized because he had too many attempts (\(loginAttemptsCount)) in since \(cleanupDate)"
			)
			return .unauthorized(
				.init(
					body: .json(
						.init(details: "User or password not valid")
					)))
		}

		let user = try await User.query(on: request.db)
			.filter(\.$username == credentials.username)
			.first()

		if let user = user, user.verifyPassword(pwd: credentials.password) {
			request.auth.login(user)
			try await user.$groups.load(on: request.db)
			try await user.$defaultGroup.load(on: request.db)

			return .ok(.init(body: .json(.init(user: user))))
		}

		try await Task.sleep(for: .seconds(onUnauthorizedLatency))
		return .unauthorized(
			.init(body: .json(.init(details: "User or password not valid"))))
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
								profile: .init(user: user))))))
		} catch is NotIdentifiedError {
			return .ok(.init(body: .json(.anonymous(.init(user: .anonymous)))))
		}
	}

	func ApiSession_updateMe(_ input: Operations.ApiSession_updateMe.Input) async throws
		-> Operations.ApiSession_updateMe.Output
	{
		let user = try await getUser(fromRequest: request)

		let updateUser: Components.Schemas.UpdateMyProfile
		switch input.body {
		case .json(let _updateUser):
			updateUser = _updateUser
		}

		guard
			let newDefaultGroupId = try await request.application.userGroupService
				.validateGroupId(
					groupId: updateUser.defaultGroupId,
					forUserId: user.requireID())
		else {
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "Invalid default Group Id",
							code: ApiError.API10017.rawValue))))
		}

		var newPassword: String?
		if let _newPassword = updateUser.newPassword {
			newPassword = _newPassword
			guard let password = updateUser.password else {
				return .badRequest(
					.init(
						body: .json(
							.init(
								message:
									"password is required for changing the password",
								code: ApiError.API10019.rawValue))))
			}
			if !user.verifyPassword(pwd: password) {
				return .badRequest(
					.init(
						body: .json(
							.init(
								message:
									"password should be the old password",
								code: ApiError.API10020.rawValue))))
			}
		}

		user.email = updateUser.email
		user.firstName = updateUser.firstName
		user.lastName = updateUser.lastName
		user.$defaultGroup.id = newDefaultGroupId

		if let newPassword {
			try user.setPassword(pwd: newPassword)
		}

		try await user.save(on: request.db)

		return .ok(.init(body: .json(.init(user: user))))
	}

	func ApiSession_logout(_ input: Operations.ApiSession_logout.Input) async throws
		-> Operations.ApiSession_logout.Output
	{
		request.auth.logout(User.self)
		return .ok(.init(body: .json(true)))
	}
}
