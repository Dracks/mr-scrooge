import Graphiti
import Vapor
import Fluent

extension MrScroogeResolver {
    func graphs(request req: Request, arguments: NoArguments) async throws -> [GraphTypes.GqlGraph] {
        guard let user = req.auth.get(User.self) else {
            throw Abort(.unauthorized)
        }
        
        let groupIds = try await user.getGroupsIds(on: req.db)
        return try await GraphTypes.graphService.getGraphs(on: req.db, groupsId: groupIds)
    }
    
    func newGraph(request req: Request, arguments: GraphTypes.NewGraphArguments) async throws -> GraphTypes.GraphResponse {
        guard let user = req.auth.get(User.self) else {
            throw Abort(.unauthorized)
        }
        
        let userGroupIds = try await user.getGroupsIds(on: req.db)
        guard let groupId = userGroupIds.first(where: { $0 == arguments.graph.groupOwnerId }) else {
            return WrongOwnerId(validOwners: userGroupIds)
        }
        
        let graph = Graph(
            groupOwnerId: groupId,
            name: arguments.graph.name,
            kind: arguments.graph.kind,
            labelFilterId: arguments.graph.labelFilterId,
            dateRange: arguments.graph.dateRange
        )
        
        try await graph.save(on: req.db)
        return graph
    }
    
    /*func updateGraph(request req: Request, arguments: GraphTypes.UpdateGraphArguments) async throws -> Graph {
        guard let user = req.auth.get(User.self) else {
            throw Abort(.unauthorized)
        }
        
        guard let graph = try await Graph.find(arguments.graph.id, on: req.db) else {
            throw Abort(.notFound)
        }
        
        let userGroups = try await user.$groups.get(on: req.db)
        guard userGroups.contains(where: { $0.id == graph.$groupOwner.id }) else {
            throw Abort(.forbidden)
        }
        
        graph.name = arguments.graph.name
        graph.kind = arguments.graph.kind
        graph.$labelFilter.id = arguments.graph.labelFilterId
        graph.dateRange = arguments.graph.dateRange
        
        try await graph.save(on: req.db)
        return graph
    }*/
}

class GraphTypes {
    static let graphService = GraphService()
    struct GqlGraph: Codable, GraphResponse {
        let id: UUID
        let groupOwnerId: UUID
        let name: String
        let kind: GraphKind
        let labelFilterId: UUID?
        let dateRange: GraphDateRange
        let group: GqlGroup
        let horizontalGroup: GqlHorizontalGroup?

        init(id: UUID, groupOwnerId: UUID, name: String, kind: GraphKind, labelFilterId: UUID?, dateRange: GraphDateRange, group: GqlGroup, horizontalGroup: GqlHorizontalGroup?) {
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
        let horizontalGroup:GqlInputHorizontalGroup?
    }

    struct UpdateGraphArguments: Codable {
        let graph: UpdatedGraph
    }

    struct UpdatedGraph: Codable {
        let id: UUID
        let name: String
        let kind: GraphKind
        let labelFilterId: UUID?
        let dateRange: GraphDateRange
        let group: GqlInputGroup
        let horizontalGroup:GqlInputHorizontalGroup
    }

    protocol GraphResponse {}

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
            
            Input(NewGraph.self){
                InputField("groupOwnerId", at: \.groupOwnerId)
                InputField("name", at: \.name)
                InputField("kind", at: \.kind)
                InputField("labelFilterId", at: \.labelFilterId)
                InputField("dateRange", at: \.dateRange)
                InputField("group", at: \.group)
                InputField("horizontalGroup", at: \.horizontalGroup)
            }
            
            Input(UpdatedGraph.self){
                InputField("id", at: \.id)
                InputField("name", at: \.name)
                InputField("kind", at: \.kind)
                InputField("labelFilterId", at: \.labelFilterId)
                InputField("dateRange", at: \.dateRange)
                InputField("group", at: \.group)
                InputField("horizontalGroup", at: \.horizontalGroup)
            }
            
           
            Union(GraphResponse.self, members: GqlGraph.self, WrongOwnerId.self)
        }
        
        @FieldDefinitions
        override var query: Fields {
            Field("graphs", at: MrScroogeResolver.graphs)
        }
        
        @FieldDefinitions
        override var mutation: Fields {
            Field("newGraph", at: MrScroogeResolver.newGraph) {
                Argument("graph", at: \.graph)
            }
            /*Field("updateGraph", at: MrScroogeResolver.updateGraph) {
                Argument("graph", at: \.graph)
            }*/
        }
    }
}
extension Graph: GraphTypes.GraphResponse {}
extension WrongOwnerId: GraphTypes.GraphResponse{}

