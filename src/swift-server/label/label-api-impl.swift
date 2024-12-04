import Foundation
import OpenAPIRuntime

extension MrScroogeAPIImpl {
	func ApiLabels_create(_ input: Operations.ApiLabels_create.Input) async throws
		-> Operations.ApiLabels_create.Output
	{
		let user = try await getUser(fromRequest: request)
		let groupOwnerId: UUID
		var inputLabel: Components.Schemas.CreateLabel
		switch input.body {
		case .json(let _label):
			inputLabel = _label
		}

		switch try
			(TransformerAndValidator.groupOwner(inputLabel, on: request.db, for: user))
		{
		case .notUuid:
			return .badRequest(
				.init(
					body: .json(
						.init(
							message: "GroupOwner ID is not an UUID",
							code: ApiError.API10025.rawValue))))
		case .notOwned(let validGroups):
			return .forbidden(
				.init(
					body: .json(
						.init(
							message: "Invalid Group Owner ID",
							code: ApiError.API10004.rawValue,
							validGroupOwners: validGroups.map {
								$0.uuidString
							}))))
		case .ok(let _groupId):
			groupOwnerId = _groupId
		}

		let label = try await request.application.labelService.createLabel(
			label: .init(groupOwnerId: groupOwnerId, name: inputLabel.name))

		return .ok(.init(body: .json(.init(label: label))))
	}

	func ApiLabels_list(_ input: Operations.ApiLabels_list.Input) async throws
		-> Operations.ApiLabels_list.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		let data = try await request.application.labelService.getAll(
			pageQuery: .init(
				limit: input.query.limit ?? 100, cursor: input.query.cursor),
			groupIds: validGroupsIds)

		return .ok(
			.init(
				body: .json(
					.init(
						results: data.list.map { .init(label: $0) },
						next: data.next))))
	}

	func ApiLabels_update(_ input: Operations.ApiLabels_update.Input) async throws
		-> Operations.ApiLabels_update.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}

	func ApiLabels_delete(_ input: Operations.ApiLabels_delete.Input) async throws
		-> Operations.ApiLabels_delete.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}
}

extension Components.Schemas.CreateLabel: InputWithUserGroup {}

extension Components.Schemas.Label {
	init(label: Label) {
		id = label.id!.uuidString
		name = label.name
		groupOwnerId = label.$groupOwner.id.uuidString
	}
}
