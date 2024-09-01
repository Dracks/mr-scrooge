import Fluent
import Vapor

class GraphBuilder {
	var graph: GraphTypes.GqlGraph {
		var horizontalGroup: GraphTypes.GqlHorizontalGroup?
		if let _horizontalGroup = _horizontalGroup {
			horizontalGroup = GraphTypes.GqlHorizontalGroup(
				group: _horizontalGroup.group,
				hideOthers: _horizontalGroup.hideOthers,
				labels: _horizontalGroupLabelIds,
				accumulate: _horizontalGroup.accumulate
			)
		}
		return GraphTypes.GqlGraph(
			id: _graph.id!,
			groupOwnerId: _graph.$groupOwner.id,
			name: _graph.name,
			kind: _graph.kind,
			labelFilterId: _graph.$labelFilter.id,
			dateRange: _graph.dateRange,
			group: GraphTypes.GqlGroup(
				group: _group.group,
				hideOthers: _group.hideOthers,
				labels: _groupLabelIds
			),
			horizontalGroup: horizontalGroup
		)
	}

	private let _graph: Graph
	private let _group: GraphGroup
	private var _groupLabelIds: [UUID]?
	private var _horizontalGroup: GraphHorizontalGroup?
	private var _horizontalGroupLabelIds: [UUID]?

	init(graph: Graph, group: GraphGroup) {
		_graph = graph
		_group = group
	}

	func setGroupLabels(_ groupLabels: [GraphGroupLabels]) {
		_groupLabelIds = groupLabels.map { $0.$label.id }
	}

	func setGroupLabels(_ groupLabels: [UUID]) {
		_groupLabelIds = groupLabels
	}

	func setHorizontalGroup(_ horizontalGroup: GraphHorizontalGroup) {
		_horizontalGroup = horizontalGroup
	}

	func setHorizontalGroupLabels(_ horizontalGroupLabels: [GraphHorizontalGroupLabels]) {
		_horizontalGroupLabelIds = horizontalGroupLabels.map { $0.$label.id }
	}

	func setHorizontalGroupLabels(_ horizontalGroupLabels: [UUID]) {
		_horizontalGroupLabelIds = horizontalGroupLabels
	}
}

class GraphService {
	private func validateLabels(
		on db: Database, groupOwnerId: UUID, group: GraphTypes.GqlInputGroup,
		horizontalGroup:
			GraphTypes.GqlHorizontalGroup?
	) async throws -> InvalidLabels? {
		var searchLabelIds = Set<UUID>()
		if let labels = group.labels {
			labels.forEach { searchLabelIds.insert($0) }
		}
		if let horizontalGroup = horizontalGroup, let labels = horizontalGroup.labels {
			labels.forEach { searchLabelIds.insert($0) }
		}

		let dbLabels = try await Label.query(on: db)
			.filter(\.$id ~~ searchLabelIds)
			.filter(\.$groupOwner.$id == groupOwnerId)
			.all()
		let foundLabelIds = Set(dbLabels.compactMap { try? $0.requireID() })

		if foundLabelIds.count != searchLabelIds.count {
			let missingLabels = searchLabelIds.subtracting(foundLabelIds)
			return InvalidLabels(
				validLabels: Array(foundLabelIds),
				invalidLabels: Array(missingLabels))
		}

		return nil
	}

	func createGraph(on db: Database, _ newGraph: GraphTypes.NewGraph) async throws
		-> GraphTypes.GraphResponse
	{
		return try await db.transaction { transaction in
			if let invalid = try await self.validateLabels(
				on: transaction, groupOwnerId: newGraph.groupOwnerId,
				group: newGraph.group, horizontalGroup: newGraph.horizontalGroup)
			{
				return invalid
			}

			let graph = Graph(
				groupOwnerId: newGraph.groupOwnerId,
				name: newGraph.name,
				kind: newGraph.kind,
				labelFilterId: newGraph.labelFilterId,
				dateRange: newGraph.dateRange
			)
			try await graph.save(on: transaction)

			let group = GraphGroup(
				graphId: graph.id!,
				group: newGraph.group.group,
				hideOthers: newGraph.group.hideOthers
			)
			try await group.save(on: transaction)

			let graphBuilder = GraphBuilder(graph: graph, group: group)

			if let labels = newGraph.group.labels {
				var count = 0
				for labelId in labels {
					let graphGroupLabel = GraphGroupLabels(
						graphId: group.id!, labelId: labelId, order: count)
					count += 1
					try await graphGroupLabel.save(on: transaction)
				}
				graphBuilder.setGroupLabels(labels)
			}

			if let newHorizontalGroup = newGraph.horizontalGroup {
				let horizontalGroup = GraphHorizontalGroup(
					graphId: graph.id!,
					group: newHorizontalGroup.group,
					hideOthers: newHorizontalGroup.hideOthers,
					accumulate: newHorizontalGroup.accumulate ?? false
				)
				try await horizontalGroup.save(on: transaction)

				graphBuilder.setHorizontalGroup(horizontalGroup)

				if let labels = newHorizontalGroup.labels {
					var count = 0
					for labelId in labels {
						let graphGroupLabel = GraphHorizontalGroupLabels(
							graphId: group.id!, labelId: labelId,
							order: count)
						count += 1
						try await graphGroupLabel.save(on: transaction)
					}
					graphBuilder.setHorizontalGroupLabels(labels)
				}
			}

			return graphBuilder.graph
		}
	}

	func getGraphs(on db: Database, groupsId: [UUID], graphsIds: [UUID]?) async throws
		-> [GraphTypes.GqlGraph]
	{
		let graphsQuery = Graph.query(on: db)
			.filter(\.$groupOwner.$id ~~ groupsId)
		if let graphsIds = graphsIds {
			graphsQuery.filter(\.$id ~~ graphsIds)
		}
		let graphs =
			try await graphsQuery
			.with(\.$group)
			.with(\.$horizontalGroup)
			.all()

		return try await withThrowingTaskGroup(of: GraphTypes.GqlGraph.self) { group in
			for graph in graphs {
				group.addTask {
					let graphId = try graph.requireID()
					guard let graphGroup = graph.group else {
						//guard let graphGroup = try await GraphGroup.query(on: db).filter(\.$graph.$id == graphId).first() else {
						throw Exception(
							.E10001,
							context: ["graphId": try graph.requireID()])
					}
					let graphBuilder = GraphBuilder(
						graph: graph, group: graphGroup)
					let groupLabels = try await GraphGroupLabels.query(on: db)
						.filter(\.$graph.$id == graphId)
						.sort(\.$order, .ascending)
						.all()
					if groupLabels.count > 0 {
						graphBuilder.setGroupLabels(
							groupLabels.map { $0.$label.id })
					}

					if let horizontalGroup = graph.horizontalGroup {
						graphBuilder.setHorizontalGroup(horizontalGroup)
						let horizontalLabels =
							try await GraphHorizontalGroupLabels.query(
								on: db
							)
							.filter(\.$graph.$id == graphId)
							.sort(\.$order, .ascending)
							.all()

						if horizontalLabels.count > 0 {
							graphBuilder.setHorizontalGroupLabels(
								horizontalLabels.map {
									$0.$label.id
								})
						}
					}

					return graphBuilder.graph
				}
			}

			var result: [GraphTypes.GqlGraph] = []
			for try await gqlGraph in group {
				result.append(gqlGraph)
			}
			return result
		}
	}

	func updateGraph(
		on db: Database, graph updatedGraph: GraphTypes.UpdateGraph, forUser user: User
	) async throws -> GraphTypes.UpdateGraphResponse {
		return try await db.transaction { transaction in
			let validGroupsId = try user.groups.map { try $0.requireID() }
			let graph = try await Graph.query(on: transaction)
				.filter(\.$id == updatedGraph.id)
				.filter(\.$groupOwner.$id ~~ validGroupsId)
				.with(\.$group)
				.with(\.$horizontalGroup)
				.first()
			guard let graph = graph else {
				return GraphTypes.GraphNotFound(graphId: updatedGraph.id)
			}

			if let invalid = try await self.validateLabels(
				on: transaction, groupOwnerId: updatedGraph.groupOwnerId,
				group: updatedGraph.group,
				horizontalGroup: updatedGraph.horizontalGroup)
			{
				return invalid
			}

			// Update graph properties
			graph.name = updatedGraph.name
			graph.kind = updatedGraph.kind
			graph.$labelFilter.id = updatedGraph.labelFilterId
			graph.dateRange = updatedGraph.dateRange

			try await graph.save(on: transaction)

			// Update or create graph group
			if let group = try await graph.$group.get(on: transaction) {
				group.group = updatedGraph.group.group
				group.hideOthers = updatedGraph.group.hideOthers
				try await group.save(on: transaction)
			} else {
				let newGroup = GraphGroup(
					graphId: try graph.requireID(),
					group: updatedGraph.group.group,
					hideOthers: updatedGraph.group.hideOthers)
				try await newGroup.save(on: transaction)
			}

			// Update graph group labels
			try await GraphGroupLabels.query(on: transaction).filter(
				\.$graph.$id == graph.id!
			).delete()
			if let groupLabels = updatedGraph.group.labels {
				for (index, labelId) in groupLabels.enumerated() {
					let groupLabel = GraphGroupLabels(
						graphId: try graph.requireID(), labelId: labelId,
						order: index)
					try await groupLabel.save(on: transaction)
				}
			}

			// Update or create horizontal group
			if let horizontalGroup = updatedGraph.horizontalGroup {
				if let existingHorizontalGroup = try await graph.$horizontalGroup
					.get(on: transaction)
				{
					existingHorizontalGroup.group = horizontalGroup.group
					existingHorizontalGroup.hideOthers =
						horizontalGroup.hideOthers
					existingHorizontalGroup.accumulate =
						horizontalGroup.accumulate ?? false
					try await existingHorizontalGroup.save(on: transaction)
				} else {
					let newHorizontalGroup = GraphHorizontalGroup(
						graphId: try graph.requireID(),
						group: horizontalGroup.group,
						hideOthers: horizontalGroup.hideOthers,
						accumulate: horizontalGroup.accumulate ?? false
					)
					try await newHorizontalGroup.save(on: transaction)
				}

				// Update horizontal group labels
				try await GraphHorizontalGroupLabels.query(on: transaction).filter(
					\.$graph.$id == graph.id!
				).delete()
				if let horizontalLabels = horizontalGroup.labels {
					for (index, labelId) in horizontalLabels.enumerated() {
						let horizontalLabel = GraphHorizontalGroupLabels(
							graphId: try graph.requireID(),
							labelId: labelId, order: index)
						try await horizontalLabel.save(on: transaction)
					}
				}
			} else if let horizontalGroup = graph.horizontalGroup {
				try await horizontalGroup.delete(on: transaction)
			}

			// Fetch updated graph data
			let updatedGraphData = try await Graph.query(on: transaction)
				.filter(\.$id == graph.id!)
				.with(\.$group)
				.with(\.$horizontalGroup)
				.first()

			guard let updatedGraphData = updatedGraphData else {
				throw Abort(.internalServerError)
			}

			let graphBuilder = GraphBuilder(
				graph: updatedGraphData, group: updatedGraphData.group!)

			let groupLabels = try await GraphGroupLabels.query(on: transaction)
				.filter(\.$graph.$id == graph.id!)
				.sort(\.$order, .ascending)
				.all()

			if !groupLabels.isEmpty {
				graphBuilder.setGroupLabels(groupLabels.map { $0.$label.id })
			}

			if let horizontalGroup = updatedGraphData.horizontalGroup {
				graphBuilder.setHorizontalGroup(horizontalGroup)
				let horizontalLabels = try await GraphHorizontalGroupLabels.query(
					on: transaction
				)
				.filter(\.$graph.$id == graph.id!)
				.sort(\.$order, .ascending)
				.all()

				if !horizontalLabels.isEmpty {
					graphBuilder.setHorizontalGroupLabels(
						horizontalLabels.map { $0.$label.id })
				}
			}

			return graphBuilder.graph
		}

	}

	func deleteGraph(on database: Database, graphId: UUID, forUser user: User) async throws
		-> GraphTypes.DeleteGraphResponse
	{
		return try await database.transaction { transaction in
			let validGroupsId = try user.groups.map { try $0.requireID() }
			// Delete the graph
			let graph = try await Graph.query(on: transaction)
				.filter(\.$id == graphId)
				.filter(\.$groupOwner.$id ~~ validGroupsId)
				.with(\.$group)
				.with(\.$horizontalGroup)
				.first()
			guard let graph = graph else {
				return GraphTypes.GraphNotFound(graphId: graphId)
			}

			// Delete horizontal group labels
			try await GraphHorizontalGroupLabels.query(on: transaction)
				.filter(\.$graph.$id == graphId)
				.delete()

			// Delete horizontal group
			try await GraphHorizontalGroup.query(on: transaction)
				.filter(\.$graph.$id == graphId)
				.delete()

			// Delete group labels
			try await GraphGroupLabels.query(on: transaction)
				.filter(\.$graph.$id == graphId)
				.delete()

			// Delete associated group
			try await GraphGroup.query(on: transaction)
				.filter(\.$graph.$id == graphId)
				.delete()

			try await graph.delete(on: transaction)

			return DeleteConfirmation(confirm: true)
		}
	}
}
