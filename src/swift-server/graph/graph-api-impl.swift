import Foundation
import OpenAPIRuntime
import OpenAPIVapor
import swift_macros

extension MrScroogeAPIImpl {
	func ApiGraphs_create(_ input: Operations.ApiGraphs_create.Input) async throws
		-> Operations.ApiGraphs_create.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsId = try user.groups.map { return try $0.requireID() }
		var graphData: Components.Schemas.GraphParam
		switch input.body {
		case .json(let _graphData):
			graphData = _graphData
		}

		guard let groupOwnerId = UUID(uuidString: graphData.groupOwnerId),
			validGroupsId.contains(groupOwnerId)
		else {
			return .forbidden(
				.init(
					body: .json(
						.init(
							message: "Not valid groupOwnerId",
							code: ApiError.API10004.rawValue,
							validGroupOwners: validGroupsId.map {
								$0.uuidString
							}))))

		}

		let data = try await request.application.graphService.createGraph(graphData)
		switch data {
		case let .invalidLabels(data: info):
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Invalid labels",
							code: ApiError.API10005.rawValue,
							validLabels: info.validLabels,
							invalidLabels: info.invalidLabels))))
		case let .ok(data: newGraph):
			return .created(.init(body: .json(newGraph)))
		}
	}

	func ApiGraphs_list(_ input: Operations.ApiGraphs_list.Input) async throws
		-> Operations.ApiGraphs_list.Output
	{
		let user = try await getUser(fromRequest: request)

		let validGroupsId = try user.groups.map { return try $0.requireID() }

		var graphIds: [UUID]?
		if let inputGraphIds = input.query.graphIds {
			graphIds = inputGraphIds.map { UUID(uuidString: $0)! }
		}

		let data = try await request.application.graphService.getGraphs(
			pageQuery: .init(
				limit: input.query.limit ?? 100, cursor: input.query.cursor),
			groupsId: validGroupsId, graphsIds: graphIds)

		return .ok(.init(body: .json(.init(results: data.list, next: data.next))))
	}

	func ApiGraphs_update(_ input: Operations.ApiGraphs_update.Input) async throws
		-> Operations.ApiGraphs_update.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsId = try user.groups.map { return try $0.requireID() }
		var graphData: Components.Schemas.GraphParam
		switch input.body {
		case .json(let _graphData):
			graphData = _graphData
		}

		guard let groupOwnerId = UUID(uuidString: graphData.groupOwnerId),
			validGroupsId.contains(groupOwnerId)
		else {
			return .forbidden(
				.init(
					body: .json(
						.init(
							message: "Not valid groupOwnerId",
							code: ApiError.API10004.rawValue,
							validGroupOwners: validGroupsId.map {
								$0.uuidString
							}))))

		}

		guard let graphId = UUID(uuidString: input.path.id) else {
			// ToDo this should be a bad request
			return .notFound(
				.init(
					body: .json(
						.init(
							value2: .init(
								message: "Id is not an uuid",
								code: ApiError.API10007.rawValue))))
			)
		}

		let data = try await request.application.graphService.updateGraph(
			withId: graphId, graph: graphData, forUser: user)
		switch data {
		case let .invalidLabels(data: info):
			return .notFound(
				.init(
					body: .json(
						.init(
							value1: .init(
								message: "Invalid labels",
								code: ApiError.API10006.rawValue,
								validLabels: info.validLabels,
								invalidLabels: info.invalidLabels)))
				))
		case let .notFound(graphId: graphId):
			return .notFound(
				.init(
					body: .json(
						.init(
							value2: .init(
								message:
									"Graph ID(\(graphId)) not found",
								code: ApiError.API10008.rawValue))))
			)
		case let .ok(data: newGraph):
			return .ok(.init(body: .json(newGraph)))
		}
	}

	func ApiGraphs_move(_ input: Operations.ApiGraphs_move.Input) async throws
		-> Operations.ApiGraphs_move.Output
	{
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		guard let graphId = UUID(uuidString: input.path.id) else {
			return #BasicBadRequest(
				msg: "Graph ID should be an UUID", code: ApiError.API10056
			)
		}
		let direction: Components.Schemas.MoveDirection
		switch input.body {
		case .json(let inputData):
			direction = inputData.direction
		}
		switch try await request.application.graphService.moveGraph(
			graphId: graphId, direction: direction, for: validGroupsIds)
		{
		case .notFound:
			return #BasicNotFound(msg: "Graph not found", code: ApiError.API10057)
		case .updated(let graphs):
			return .ok(.init(body: .json(.init(results: graphs))))
		}
	}

	func ApiGraphs_delete(_ input: Operations.ApiGraphs_delete.Input) async throws
		-> Operations.ApiGraphs_delete.Output
	{
		let user = try await getUser(fromRequest: request)
		guard let graphId = UUID(uuidString: input.path.id) else {
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Graph ID is not an UUID",
							code: ApiError.API10009.rawValue))))
		}

		let data = try await request.application.graphService.deleteGraph(
			graphId: graphId, forUser: user)
		switch data {
		case let .notFound(graphId: graphId):
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Graph ID \(graphId) not found",
							code: ApiError.API10010.rawValue))))
		case .ok:
			return .ok(.init(body: .json(.init(true))))
		}
	}
}
