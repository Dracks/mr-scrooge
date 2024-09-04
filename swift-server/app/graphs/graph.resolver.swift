import Fluent
import Graphiti
import Vapor

extension MrScroogeResolver {
	func graphs(request req: Request, arguments: GraphTypes.GqlGetGraphsArgs) async throws
		-> [GraphTypes.GqlGraph]
	{
		guard let user = req.auth.get(User.self) else {
			throw Abort(.unauthorized)
		}

		let groupIds = try await user.getGroupsIds(on: req.db)
		return try await GraphTypes.graphService.getGraphs(
			on: req.db, groupsId: groupIds, graphsIds: arguments.graphIds)
	}

	func newGraph(request req: Request, arguments: GraphTypes.NewGraphArguments) async throws
		-> GraphTypes.GraphResponse
	{
		guard let user = req.auth.get(User.self) else {
			throw Abort(.unauthorized)
		}

		let userGroupIds = try await user.getGroupsIds(on: req.db)
		guard let _ = userGroupIds.first(where: { $0 == arguments.graph.groupOwnerId })
		else {
			return WrongOwnerId(validOwners: userGroupIds)
		}

		return try await GraphTypes.graphService.createGraph(on: req.db, arguments.graph)
	}

	func updateGraph(request req: Request, arguments: GraphTypes.UpdateGraphArguments)
		async throws -> GraphTypes.UpdateGraphResponse
	{
		let user = try await getUser(fromRequest: req)

		let userGroupIds = try await user.getGroupsIds(on: req.db)
		guard let _ = userGroupIds.first(where: { $0 == arguments.graph.groupOwnerId })
		else {
			return WrongOwnerId(validOwners: userGroupIds)
		}

		return try await GraphTypes.graphService.updateGraph(
			on: req.db, graph: arguments.graph, forUser: user)
	}

	func deleteGraph(request req: Request, arguments: GraphTypes.DeleteGraphArg) async throws
		-> GraphTypes.DeleteGraphResponse
	{
		let user = try await getUser(fromRequest: req)

		return try await GraphTypes.graphService.deleteGraph(
			on: req.db, graphId: arguments.graphId, forUser: user)
	}
}

class GraphTypes {
	static let graphService = GraphService()
	struct GqlGraph: Codable, GraphResponse, UpdateGraphResponse {
		let id: UUID
		let groupOwnerId: UUID
		let name: String
		let kind: GraphKind
		let labelFilterId: UUID?
		let dateRange: GraphDateRange
		let group: GqlGroup
		let horizontalGroup: GqlHorizontalGroup?

		init(
			id: UUID, groupOwnerId: UUID, name: String, kind: GraphKind,
			labelFilterId: UUID?, dateRange: GraphDateRange, group: GqlGroup,
			horizontalGroup: GqlHorizontalGroup?
		) {
			self.id = id
			self.groupOwnerId = groupOwnerId
			self.name = name
			self.kind = kind
			self.labelFilterId = labelFilterId
			self.dateRange = dateRange
			self.group = group
			self.horizontalGroup = horizontalGroup
		}
	}

	class GqlGroup: Codable {
		let group: GraphGroupType
		let hideOthers: Bool?
		var labels: [UUID]?

		init(group: GraphGroupType, hideOthers: Bool?, labels: [UUID]?) {
			self.group = group
			self.hideOthers = hideOthers
			self.labels = labels
		}
	}

	class GqlHorizontalGroup: GqlGroup {
		let accumulate: Bool?

		init(group: GraphGroupType, hideOthers: Bool?, labels: [UUID]?, accumulate: Bool?) {
			self.accumulate = accumulate
			super.init(group: group, hideOthers: hideOthers, labels: labels)
		}

		required init(from decoder: Decoder) throws {
			let container = try decoder.container(keyedBy: CodingKeys.self)
			accumulate = try container.decodeIfPresent(Bool.self, forKey: .accumulate)
			try super.init(from: decoder)
		}

		private enum CodingKeys: String, CodingKey {
			case accumulate
		}
	}

	class GqlGetGraphsArgs: Codable {
		let graphIds: [UUID]?
	}

	class GqlInputGroup: GqlGroup {}
	class GqlInputHorizontalGroup: GqlHorizontalGroup {}

	struct NewGraphArguments: Codable {
		let graph: NewGraph
	}

	struct NewGraph: Codable {
		let groupOwnerId: UUID
		let name: String
		let kind: GraphKind
		let labelFilterId: UUID?
		let dateRange: GraphDateRange
		let group: GqlInputGroup
		let horizontalGroup: GqlInputHorizontalGroup?
	}

	struct UpdateGraphArguments: Codable {
		let graph: UpdateGraph
	}

	struct UpdateGraph: Codable {
		let id: UUID
		let name: String
		let kind: GraphKind
		let labelFilterId: UUID?
		let dateRange: GraphDateRange
		let groupOwnerId: UUID
		let group: GqlInputGroup
		let horizontalGroup: GqlInputHorizontalGroup?
	}

	protocol GraphResponse {}

	struct InvalidGraph: Codable, UpdateGraphResponse {
		let availableGraphIds: [UUID]
	}
	struct GraphNotFound: Codable, UpdateGraphResponse, DeleteGraphResponse {
		let graphId: UUID
	}

	protocol UpdateGraphResponse {}

	struct DeleteGraphArg: Codable {
		let graphId: UUID
	}
	protocol DeleteGraphResponse {}

	class Schema: PartialSchema<MrScroogeResolver, Request> {
		@TypeDefinitions
		override var types: Types {
			Enum(GraphKind.self)
			Enum(GraphGroupType.self, as: "GraphGroup")
			Enum(GraphDateRange.self)

			Type(GqlGraph.self, as: "Graph") {
				Field("id", at: \.id)
				Field("groupOwnerId", at: \.groupOwnerId)
				Field("name", at: \.name)
				Field("kind", at: \.kind)
				Field("labelFilterId", at: \.labelFilterId)
				Field("dateRange", at: \.dateRange)
				Field("group", at: \.group)
				Field("horizontalGroup", at: \.horizontalGroup)
			}

			Type(GqlGroup.self, as: "Group") {
				Field("group", at: \.group)
				Field("hideOthers", at: \.hideOthers)
				Field("labels", at: \.labels)
			}

			Type(GqlHorizontalGroup.self, as: "HorizontalGroup") {
				Field("group", at: \.group)
				Field("hideOthers", at: \.hideOthers)
				Field("labels", at: \.labels)
				Field("accumulate", at: \.accumulate)
			}

			Input(GqlInputGroup.self, as: "InputGroup") {
				InputField("group", at: \.group)
				InputField("hideOthers", at: \.hideOthers)
				InputField("labels", at: \.labels)
			}

			Input(GqlInputHorizontalGroup.self, as: "InputHorizontalGroup") {
				InputField("group", at: \.group)
				InputField("hideOthers", at: \.hideOthers)
				InputField("labels", at: \.labels)
				InputField("accumulate", at: \.accumulate)
			}

			Input(NewGraph.self) {
				InputField("groupOwnerId", at: \.groupOwnerId)
				InputField("name", at: \.name)
				InputField("kind", at: \.kind)
				InputField("labelFilterId", at: \.labelFilterId)
				InputField("dateRange", at: \.dateRange)
				InputField("group", at: \.group)
				InputField("horizontalGroup", at: \.horizontalGroup)
			}

			Input(UpdateGraph.self) {
				InputField("id", at: \.id)
				InputField("name", at: \.name)
				InputField("kind", at: \.kind)
				InputField("labelFilterId", at: \.labelFilterId)
				InputField("dateRange", at: \.dateRange)
				InputField("groupOwnerId", at: \.groupOwnerId)
				InputField("group", at: \.group)
				InputField("horizontalGroup", at: \.horizontalGroup)
			}

			Type(GraphNotFound.self) {
				Field("graphId", at: \.graphId)
			}

			Union(
				GraphResponse.self, members: GqlGraph.self, WrongOwnerId.self,
				InvalidLabels.self)
			Union(
				UpdateGraphResponse.self, members: GqlGraph.self,
				GraphNotFound.self, InvalidLabels.self, WrongOwnerId.self)
			Union(
				DeleteGraphResponse.self, members: DeleteConfirmation.self,
				GraphNotFound.self)
		}

		@FieldDefinitions
		override var query: Fields {
			Field("graphs", at: MrScroogeResolver.graphs) {
				Argument("graphIds", at: \.graphIds)
			}
		}

		@FieldDefinitions
		override var mutation: Fields {
			Field("newGraph", at: MrScroogeResolver.newGraph) {
				Argument("graph", at: \.graph)
			}
			Field("updateGraph", at: MrScroogeResolver.updateGraph) {
				Argument("graph", at: \.graph)
			}
			Field("deleteGraph", at: MrScroogeResolver.deleteGraph) {
				Argument("graphId", at: \.graphId)
			}
		}
	}
}
extension Graph: GraphTypes.GraphResponse {}
extension WrongOwnerId: GraphTypes.GraphResponse, GraphTypes.UpdateGraphResponse {}
extension InvalidLabels: GraphTypes.GraphResponse, GraphTypes.UpdateGraphResponse {}
extension DeleteConfirmation: GraphTypes.DeleteGraphResponse {}
