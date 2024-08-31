import Fluent
import Vapor

class GraphService {
    func createGraph(on db: Database, _ newGraph: GraphTypes.NewGraph) async throws -> GraphTypes.GqlGraph {
        let graph = Graph(
            groupOwnerId: newGraph.groupOwnerId,
            name: newGraph.name,
            kind: newGraph.kind,
            labelFilterId: newGraph.labelFilterId,
            dateRange: newGraph.dateRange
        )
        try await graph.save(on: db)

        let group = GraphGroup(
            graphId: graph.id!,
            group: newGraph.group.group,
            hideOthers: newGraph.group.hideOthers
        )
        try await group.save(on: db)

        var gqlGroup = GraphTypes.GqlGroup(
            group: group.group,
            hideOthers: group.hideOthers,
            labels: nil
        )
        
        var searchLabelIds:[UUID] = []
        if let labels = newGraph.group.labels {
            labels.forEach { searchLabelIds.append($0)}
        }
        if let horizontalGroup = newGraph.horizontalGroup, let labels = horizontalGroup.labels {
            labels.forEach { searchLabelIds.append($0) }
        }
        
        var dbLabels  = try await Label.query(on: db)
            .filter(\.$id ~~ searchLabelIds)
            .filter(\.$groupOwner.$id == newGraph.groupOwnerId)
            .all()
        var dbLabelsDic = try Dictionary(grouping: dbLabels) { label in
            return try label.requireID()
        }
        

        if let labels = newGraph.group.labels {
            
            for labelId in labels {
                if let label = dbLabelsDic[labelId] {
                    let graphGroupLabel = GraphGroupLabels(graphId: group.id!, labelId: labelId)
                    try await graphGroupLabel.save(on: db)
                } else {
                    throw Exception(.E10000, context: ["labelId": labelId])
                }
            }
            gqlGroup.labels = labels
        }

        var gqlHorizontalGroup: GraphTypes.GqlHorizontalGroup?
        if let newHorizontalGroup = newGraph.horizontalGroup {
            let horizontalGroup = GraphHorizontalGroup(
                graphId: graph.id!,
                group: newHorizontalGroup.group,
                hideOthers: newHorizontalGroup.hideOthers,
                accumulate: newHorizontalGroup.accumulate ?? false
            )
            try await horizontalGroup.save(on: db)

            gqlHorizontalGroup = GraphTypes.GqlHorizontalGroup(
                group: horizontalGroup.group,
                hideOthers: horizontalGroup.hideOthers,
                labels: nil,
                accumulate: horizontalGroup.accumulate
            )
            
            if let labels = newHorizontalGroup.labels {
                
                for labelId in labels {
                    if let label = dbLabelsDic[labelId] {
                        let graphGroupLabel = GraphHorizontalGroupLabels(graphId: group.id!, labelId: labelId)
                        try await graphGroupLabel.save(on: db)
                    } else {
                        throw Exception(.E10002, context: ["labelId": labelId])
                    }
                }
                gqlGroup.labels = labels
            }

        }

        return GraphTypes.GqlGraph(
            id: graph.id!,
            groupOwnerId: graph.$groupOwner.id,
            name: graph.name,
            kind: graph.kind,
            labelFilterId: graph.$labelFilter.id,
            dateRange: graph.dateRange,
            group: gqlGroup,
            horizontalGroup: gqlHorizontalGroup
        )
    }

    func getGraphs(on db: Database, groupsId: [UUID]) async throws -> [GraphTypes.GqlGraph] {
        let graphs = try await Graph.query(on: db)
            .filter(\.$groupOwner.$id ~~ groupsId)
            .with(\.$group)
            .with(\.$horizontalGroup)
            .all()

        return try await withThrowingTaskGroup(of: GraphTypes.GqlGraph.self) { group in
            for graph in graphs {
                group.addTask {
                    guard let graphGroup = graph.group else {
                        throw Exception(.E10001, context: ["graphId": try graph.requireID()])
                    }
                    let groupLabels = try await GraphGroupLabels.query(on: db)
                        .filter(\.$graph.$id == graphGroup.requireID())
                        .all()

                    let gqlGroup = GraphTypes.GqlGroup(
                        group: graphGroup.group,
                        hideOthers: graphGroup.hideOthers,
                        labels: groupLabels.map { $0.$label.id }
                    )

                    var gqlHorizontalGroup: GraphTypes.GqlHorizontalGroup?
                    if let horizontalGroup = try await graph.$horizontalGroup.get(on: db) {
                        let horizontalLabels = try await GraphHorizontalGroupLabels.query(on: db)
                            .filter(\.$graph.$id == horizontalGroup.id!)
                            .all()

                        gqlHorizontalGroup = GraphTypes.GqlHorizontalGroup(
                            group: horizontalGroup.group,
                            hideOthers: horizontalGroup.hideOthers,
                            labels: horizontalLabels.map { $0.$label.id },
                            accumulate: horizontalGroup.accumulate
                        )
                    }

                    return GraphTypes.GqlGraph(
                        id: graph.id!,
                        groupOwnerId: graph.$groupOwner.id,
                        name: graph.name,
                        kind: graph.kind,
                        labelFilterId: graph.$labelFilter.id,
                        dateRange: graph.dateRange,
                        group: gqlGroup,
                        horizontalGroup: gqlHorizontalGroup
                    )
                }
            }

            var result: [GraphTypes.GqlGraph] = []
            for try await gqlGraph in group {
                result.append(gqlGraph)
            }
            return result
        }
    }
}

