import Fluent
import OpenAPIRuntime
import OpenAPIVapor
import Vapor

extension MrScroogeAPIImpl {

	func ApiGroup_create(_ input: Operations.ApiGroup_create.Input) async throws
		-> Operations.ApiGroup_create.Output
	{
		let user = try await getUser(fromRequest: request)
		var groupInput: Components.Schemas.UserGroupInput
		switch input.body {
		case .json(let _group):
			groupInput = _group
		}

		let userGroup = UserGroup(name: groupInput.name)
		try await userGroup.save(on: request.application.db)

		if !user.isAdmin {
			try await user.$groups.attach(userGroup, on: request.application.db)
		}

		return try .created(
			.init(body: .json(.init(group: userGroup))))

	}

	func ApiGroup_list(_ input: Operations.ApiGroup_list.Input) async throws
		-> Operations.ApiGroup_list.Output
	{
		let user = try await getUser(fromRequest: request)
		let pageQuery = PageQuery(limit: input.query.limit ?? 100)
		let pageData = try await request.application.userGroupService.getAll(
			user: user, pageQuery: pageQuery, orphaned: input.query.orphaned ?? false)

		return try .ok(
			.init(
				body: .json(
					.init(
						results: pageData.list.map { try .init(group: $0) },
						next: pageData.next
					)
				))
		)

	}

	func ApiGroup_updateGroup(_ input: Operations.ApiGroup_updateGroup.Input) async throws
		-> Operations.ApiGroup_updateGroup.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiGroup_delete(_ input: Operations.ApiGroup_delete.Input) async throws
		-> Operations.ApiGroup_delete.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}
}

extension Components.Schemas.UserGroup {
	init(group userGroup: UserGroup) throws {
		id = try userGroup.requireID().uuidString
		name = userGroup.name
	}
}
