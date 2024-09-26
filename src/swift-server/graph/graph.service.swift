import Fluent
import Vapor

extension GraphGroupType {
    func toApi() -> Components.Schemas.GraphGroupType {
        switch self {
        case .day:
            return .day
        case .labels:
            return .labels
        case .month:
            return .month
        case .sign:
            return .sign
        case .year:
            return .year
        }
    }
}

extension GraphKind {
    func toApi() -> Components.Schemas.GraphKind {
        switch self {
        case .bar:
            return .bar
        case .line:
            return .line
        case .pie:
            return .pie
        }
    }
}

extension GraphDateRange {
    func toApi() -> Components.Schemas.GraphDateRange {
        switch self {
        case .all:
            return .all
        case .halfYear:
            return .halfYear
        case .oneMonth:
            return .oneMonth
        case .oneYear:
            return .oneYear
        case .sixYears:
            return .sixYears
        case .twoYears:
            return .twoYears
        }
    }
}

extension Components.Schemas.GraphGroupType {
    func toInternal() -> GraphGroupType {
        switch self {
        case .day:
            return .day
        case .labels:
            return .labels
        case .month:
            return .month
        case .sign:
            return .sign
        case .year:
            return .year
        }
    }
}

extension Components.Schemas.GraphKind {
    func toInternal() -> GraphKind {
        switch self {
        case .bar:
            return .bar
        case .line:
            return .line
        case .pie:
            return .pie
        }
    }
}

extension Components.Schemas.GraphDateRange {
    func toInternal() -> GraphDateRange {
        switch self {
        case .all:
            return .all
        case .halfYear:
            return .halfYear
        case .oneMonth:
            return .oneMonth
        case .oneYear:
            return .oneYear
        case .sixYears:
            return .sixYears
        case .twoYears:
            return .twoYears
        }
    }
}


class GraphBuilder {
    var graph: Components.Schemas.Graph {
        var horizontalGroup: Components.Schemas.HorizontalGroup?
		if let _horizontalGroup = _horizontalGroup {
			horizontalGroup = Components.Schemas.HorizontalGroup(
                group: _horizontalGroup.group.toApi(),
				hideOthers: _horizontalGroup.hideOthers,
                labels: _horizontalGroupLabelIds?.map{ $0.uuidString },
				accumulate: _horizontalGroup.accumulate
			)
		}
        return .init(
            id: _graph.id!.uuidString,
            groupOwnerId: _graph.$groupOwner.id.uuidString,
			name: _graph.name,
            kind: _graph.kind.toApi(),
            labelFilterId: _graph.$labelFilter.id?.uuidString,
            dateRange: _graph.dateRange.toApi(),
            group: Components.Schemas.Group(
                group: _group.group.toApi(),
				hideOthers: _group.hideOthers,
                labels: _groupLabelIds?.map{$0.uuidString}
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
    private let cursorHandler = CursorHandler<Label, String>(["id"])
    
    struct InvalidLabels {
        let validLabels: [String]
        let invalidLabels: [String]
    }

    enum CreateGraphResponse: Sendable {
        case invalidLabels(data: InvalidLabels)
        case ok(data: Components.Schemas.Graph)
    }

    enum UpdateGraphResponse: Sendable {
        case notFound(graphId: UUID)
        case invalidLabels(data: InvalidLabels)
        case ok(data: Components.Schemas.Graph)
    }
    
    enum DeleteGraphResponse: Sendable {
        case notFound(graphId: UUID)
        case ok
    }
    
	private func validateLabels(
        on db: Database, groupOwnerId: UUID, group: Components.Schemas.Group,
		horizontalGroup:
        Components.Schemas.HorizontalGroup?,
        rootLabel: String?
    ) async throws -> InvalidLabels? {
		var searchLabelIds = Set<String>()
		if let labels = group.labels {
			labels.forEach { searchLabelIds.insert($0) }
		}
		if let horizontalGroup = horizontalGroup, let labels = horizontalGroup.labels {
			labels.forEach { searchLabelIds.insert($0) }
		}
        if let rootLabel = rootLabel {
            searchLabelIds.insert(rootLabel)
        }

		let dbLabels = try await Label.query(on: db)
            .filter(\.$id ~~ searchLabelIds.map{ UUID(uuidString: $0) ?? UUID()})
			.filter(\.$groupOwner.$id == groupOwnerId)
			.all()
        let foundLabelIds = Set(dbLabels.compactMap { try? $0.requireID().uuidString })

		if foundLabelIds.count != searchLabelIds.count {
			let missingLabels = searchLabelIds.subtracting(foundLabelIds)
            return .init(
				validLabels: Array(foundLabelIds),
				invalidLabels: Array(missingLabels))
		}

		return nil
	}

    func createGraph(on db: Database, _ newGraph: Components.Schemas.GraphParam) async throws
		-> CreateGraphResponse
	{
        let groupOwnerId = UUID(uuidString: newGraph.groupOwnerId)!
        if let invalid = try await self.validateLabels(
            on: db, groupOwnerId: groupOwnerId,
            group: newGraph.group, horizontalGroup: newGraph.horizontalGroup, rootLabel: newGraph.labelFilterId)
        {
            return .invalidLabels(data: invalid)
        }

        return .ok(data: try await db.transaction { transaction in
            var labelFilterId: UUID?
            if let _labelFilterId = newGraph.labelFilterId {
                labelFilterId = UUID(uuidString: _labelFilterId)
            }
			
			let graph = Graph(
				groupOwnerId: groupOwnerId,
				name: newGraph.name,
                kind: newGraph.kind.toInternal(),
                labelFilterId: labelFilterId,
                dateRange: newGraph.dateRange.toInternal()
			)
			try await graph.save(on: transaction)

			let group = GraphGroup(
				graphId: graph.id!,
                group: newGraph.group.group.toInternal(),
				hideOthers: newGraph.group.hideOthers
			)
			try await group.save(on: transaction)

			let graphBuilder = GraphBuilder(graph: graph, group: group)

			if let labels = newGraph.group.labels {
				var count = 0
                var uuidLabels : [UUID] = []
				for labelId in labels {
					let graphGroupLabel = GraphGroupLabels(
                        graphId: group.id!, labelId: UUID(uuidString: labelId)!, order: count)
					count += 1
                    uuidLabels.append(graphGroupLabel.$label.id)
					try await graphGroupLabel.save(on: transaction)
				}
				graphBuilder.setGroupLabels(uuidLabels)
			}

			if let newHorizontalGroup = newGraph.horizontalGroup {
				let horizontalGroup = GraphHorizontalGroup(
					graphId: graph.id!,
                    group: newHorizontalGroup.group.toInternal(),
					hideOthers: newHorizontalGroup.hideOthers,
					accumulate: newHorizontalGroup.accumulate ?? false
				)
				try await horizontalGroup.save(on: transaction)

				graphBuilder.setHorizontalGroup(horizontalGroup)

				if let labels = newHorizontalGroup.labels {
					var count = 0
                    var uuidLabels : [UUID] = []
					for labelId in labels {
						let graphGroupLabel = GraphHorizontalGroupLabels(
							graphId: group.id!, labelId: UUID(uuidString: labelId)!,
							order: count)
						count += 1
                        uuidLabels.append(graphGroupLabel.$label.id)
						try await graphGroupLabel.save(on: transaction)
					}
					graphBuilder.setHorizontalGroupLabels(uuidLabels)
				}
			}

            return graphBuilder.graph
		})
	}

	func getGraphs(on db: Database, pageQuery: PageQuery = .init(), groupsId: [UUID], graphsIds: [UUID]?) async throws
		-> ListWithCursor<Components.Schemas.Graph>
	{
		let graphsQuery = Graph.query(on: db)
			.filter(\.$groupOwner.$id ~~ groupsId)
		if let graphsIds = graphsIds {
			graphsQuery.filter(\.$id ~~ graphsIds)
		}
        
        if let cursor = pageQuery.cursor {
            let cursorData = try self.cursorHandler.parse(cursor)
            if let idString = cursorData["id"], let id=UUID(uuidString: idString) {
                graphsQuery.filter(\.$id < id)
            }
        }
        
		let graphs =
			try await graphsQuery
			.with(\.$group)
			.with(\.$horizontalGroup)
			.all()

		return try await withThrowingTaskGroup(of: Components.Schemas.Graph.self) { group in
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

			var result: [Components.Schemas.Graph] = []
			for try await gqlGraph in group {
				result.append(gqlGraph)
			}
            return pageQuery.getListWithCursor(data: result) { graph in
                cursorHandler.stringify(["id": graph.id])
            }
		}
	}

	func updateGraph(
        on db: Database, withId id: UUID, graph updatedGraph: Components.Schemas.GraphParam, forUser user: User
	) async throws -> UpdateGraphResponse {
		return try await db.transaction { transaction in
			let validGroupsId = try user.groups.map { try $0.requireID() }
			let graph = try await Graph.query(on: transaction)
				.filter(\.$id == id)
				.filter(\.$groupOwner.$id ~~ validGroupsId)
				.with(\.$group)
				.with(\.$horizontalGroup)
				.first()
			guard let graph = graph else {
                return .notFound(graphId: id)
			}

			if let invalid = try await self.validateLabels(
				on: transaction, groupOwnerId: UUID(uuidString: updatedGraph.groupOwnerId)!,
				group: updatedGraph.group,
				horizontalGroup: updatedGraph.horizontalGroup,
                rootLabel: updatedGraph.labelFilterId
            )
			{
                return .invalidLabels(data: invalid)
			}

			// Update graph properties
			graph.name = updatedGraph.name
            graph.kind = updatedGraph.kind.toInternal()
            if let labelFilterId = updatedGraph.labelFilterId {
                graph.$labelFilter.id = UUID(uuidString: labelFilterId)
            }
            graph.dateRange = updatedGraph.dateRange.toInternal()

			try await graph.save(on: transaction)

			// Update or create graph group
			if let group = try await graph.$group.get(on: transaction) {
                group.group = updatedGraph.group.group.toInternal()
				group.hideOthers = updatedGraph.group.hideOthers
				try await group.save(on: transaction)
			} else {
				let newGroup = GraphGroup(
					graphId: try graph.requireID(),
                    group: updatedGraph.group.group.toInternal(),
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
						graphId: try graph.requireID(), labelId: UUID(uuidString: labelId)!,
						order: index)
					try await groupLabel.save(on: transaction)
				}
			}

			// Update or create horizontal group
			if let horizontalGroup = updatedGraph.horizontalGroup {
				if let existingHorizontalGroup = try await graph.$horizontalGroup
					.get(on: transaction)
				{
                    existingHorizontalGroup.group = horizontalGroup.group.toInternal()
					existingHorizontalGroup.hideOthers =
						horizontalGroup.hideOthers
					existingHorizontalGroup.accumulate =
						horizontalGroup.accumulate ?? false
					try await existingHorizontalGroup.save(on: transaction)
				} else {
					let newHorizontalGroup = GraphHorizontalGroup(
						graphId: try graph.requireID(),
                        group: horizontalGroup.group.toInternal(),
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
							labelId: UUID(uuidString: labelId)!, order: index)
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

            return .ok(data: graphBuilder.graph)
		}

	}

	func deleteGraph(on database: Database, graphId: UUID, forUser user: User) async throws
		-> DeleteGraphResponse
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
                return .notFound(graphId: graphId)
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

            return .ok
		}
	}
}