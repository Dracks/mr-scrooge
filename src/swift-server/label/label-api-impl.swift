import Foundation
import OpenAPIRuntime
import swift_macros

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
			return #BasicBadRequest(
				msg: "GroupOwner ID is not an UUID", code: ApiError.API10042)
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

		return .created(.init(body: .json(try .init(label: label))))
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
						results: try data.list.map { try .init(label: $0) },
						next: data.next))))
	}

	func ApiLabels_update(_ input: Operations.ApiLabels_update.Input) async throws
		-> Operations.ApiLabels_update.Output
	{
		let user = try await getUser(fromRequest: request)

		var inputLabel: Components.Schemas.UpdateLabel
		switch input.body {
		case .json(let _label):
			inputLabel = _label
		}

		guard let labelId = UUID(uuidString: input.path.labelId) else {
			return #BasicBadRequest(
				msg: "Label ID should be an UUID", code: ApiError.API10052)
		}

		let data = try await request.application.labelService.updateLabel(
			withId: labelId, data: inputLabel, forUser: user)

		switch data {
		case .ok(let label):
			return .ok(.init(body: .json(try .init(label: label))))
		case .notFound:
			return #BasicNotFound(
				msg: "Label ID not found for this user", code: ApiError.API10053)
		}

	}

	func ApiLabels_delete(_ input: Operations.ApiLabels_delete.Input) async throws
		-> Operations.ApiLabels_delete.Output
	{
		let user = try await getUser(fromRequest: request)

		guard let labelId = UUID(uuidString: input.path.labelId) else {
			return #BasicBadRequest(
				msg: "Label ID should be an UUID", code: ApiError.API10054)
		}

		let force = input.query.force ?? false

		let data = try await request.application.labelService.deleteLabel(
			withId: labelId, deleteAll: force, forUser: user)

		switch data {
		case .ok:
			return .ok(.init(body: .json(true)))
		case .notFound:
			return #BasicNotFound(
				msg: "Label ID not found for this user", code: ApiError.API10055)
		case .inUse(
			let transactions, let graphs, let graphGroups, let graphHorizontalGroups,
			let rules):
			return .conflict(
				.init(
					body: .json(
						.init(
							graphs: graphs.map { $0.uuidString },
							graphs_group: graphGroups.map {
								$0.uuidString
							},
							graph_horizontal_group:
								graphHorizontalGroups.map {
									$0.uuidString
								},
							rules: rules.map { $0.uuidString },
							transactions: transactions.map {
								$0.uuidString
							}))))
		}
	}
}

extension Components.Schemas.CreateLabel: InputWithUserGroup {}

extension Components.Schemas.Label {
	init(label: Label) throws {
		id = try label.requireID().uuidString
		name = label.name
		groupOwnerId = label.$groupOwner.id.uuidString
	}
}
