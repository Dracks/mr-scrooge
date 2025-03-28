import Foundation
import OpenAPIRuntime
import OpenAPIVapor
import Vapor
import swift_macros

extension MrScroogeAPIImpl {
	func ApiUser_create(_ input: Operations.ApiUser_create.Input) async throws
		-> Operations.ApiUser_create.Output
	{
		let user = try await getUser(fromRequest: request)
		guard user.isAdmin else {
			return #GenericErrorReturn(
				response: "unauthorized",
				msg: "Only admin users can create new users",
				code: ApiError.API10051)
		}

		let newUserInput: Components.Schemas.CreateUserInput
		switch input.body {
		case .json(let _newUser):
			newUserInput = _newUser
		}

		let (newUser, _) = try await request.application.userService.create(
			user: .init(
				username: newUserInput.username,
				password: newUserInput.password,
				email: newUserInput.email,
				firstName: newUserInput.firstName,
				lastName: newUserInput.lastName,
				isActive: newUserInput.isActive,
				isAdmin: newUserInput.isAdmin
			), groupName: "default group for \(newUserInput.username)")
		return .created(.init(body: .json(.init(user: newUser))))
	}

	func ApiUser_list(_ input: Operations.ApiUser_list.Input) async throws
		-> Operations.ApiUser_list.Output
	{
		let user = try await getUser(fromRequest: request)
		guard user.isAdmin else {
			return #GenericErrorReturn(
				response: "unauthorized",
				msg: "Only admin users can list the users", code: ApiError.API10013)
		}

		let data = try await request.application.userService.getUsersPage(
			pageQuery: .init(
				limit: input.query.limit ?? 100, cursor: input.query.cursor))

		return .ok(
			.init(
				body: .json(
					.init(
						results: data.list.map {
							Components.Schemas.UserProfile(user: $0)
						}, next: data.next))))
	}

	func ApiUser_update(_ input: Operations.ApiUser_update.Input) async throws
		-> Operations.ApiUser_update.Output
	{
		guard try await getUser(fromRequest: request).isAdmin else {
			return #GenericErrorReturn(
				response: "unauthorized",
				msg: "Only admin users can modify other users",
				code: ApiError.API10014)
		}
		let updateUser: Components.Schemas.UpdateUserData
		switch input.body {
		case .json(let _updateUser):
			updateUser = _updateUser
		}

		guard let userId: UUID = UUID(uuidString: input.path.id) else {
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Id is not an uuid",
							code: ApiError.API10015.rawValue))))
		}

		guard
			let newDefaultGroupId = try await request.application.userGroupService
				.validateGroupId(
					groupId: updateUser.defaultGroupId,
					forUserId: userId)
		else {
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "Invalid default Group Id",
							code: ApiError.API10018.rawValue))))
		}

		let userData = User(
			username: updateUser.username,
			email: updateUser.email,
			firstName: updateUser.firstName,
			lastName: updateUser.lastName,
			isActive: updateUser.isActive,
			isAdmin: updateUser.isAdmin,
			defaultGroupId: newDefaultGroupId
		)

		let response = try await request.application.userService.updateUser(
			userId: userId, userData: userData,
			andPassword: updateUser.password)
		switch response {
		case .notFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "User with this Id was not found",
							code: ApiError.API10016.rawValue))))
		case .ok(let user):
			try await user.$groups.load(on: request.db)
			return .ok(.init(body: .json(.init(user: user))))
		}
	}

	func ApiUser_deleteGroup(_ input: Operations.ApiUser_deleteGroup.Input) async throws
		-> Operations.ApiUser_deleteGroup.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiUser_addGroup(_ input: Operations.ApiUser_addGroup.Input) async throws
		-> Operations.ApiUser_addGroup.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiUser_delete(_ input: Operations.ApiUser_delete.Input) async throws
		-> Operations.ApiUser_delete.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}
}

extension Components.Schemas.UserProfile {
	init(user: User) {
		id = user.id!.uuidString
		username = user.username
		email = user.email
		firstName = user.firstName
		lastName = user.lastName
		isActive = user.isActive
		isAdmin = user.isAdmin
		defaultGroupId = user.$defaultGroup.id.uuidString
		groups = user.groups.map { .init(group: $0) }
	}
}

extension Components.Schemas.UserGroup {
	init(group: UserGroup) {
		id = group.id!.uuidString
		name = group.name
	}
}
