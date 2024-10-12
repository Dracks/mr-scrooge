import Foundation
import OpenAPIRuntime
import OpenAPIVapor
import Vapor

let userService = UserService()
extension MrScroogeAPIImpl {
	func ApiUser_create(_ input: Operations.ApiUser_create.Input) async throws
		-> Operations.ApiUser_create.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiUser_list(_ input: Operations.ApiUser_list.Input) async throws
		-> Operations.ApiUser_list.Output
	{
		let user = try await getUser(fromRequest: request)
		guard user.isAdmin else {
			//return .unauthorized(.init())
			return .unauthorized(
				.init(
					body: .json(
						.init(
							message:
								"Only admin users can list the users",
							code: ApiError.API10013.rawValue))))
		}

		let data = try await userService.getUsersPage(
			on: request.db,
			pageQuery: .init(
				limit: input.query.limit ?? 100, cursor: input.query.cursor))

		return .ok(
			.init(
				body: .json(
					.init(
						results: data.list.map {
							Components.Schemas.UserProfile(user: $0)
						}, next: data.next))))

		// return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiUser_update(_ input: Operations.ApiUser_update.Input) async throws
		-> Operations.ApiUser_update.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
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
