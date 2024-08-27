import Graphiti
import Vapor
import Fluent

extension MrScroogeResolver {
    func graphs(request req: Request, arguments: NoArguments) async throws -> [Graph] {
        guard let user = req.auth.get(User.self) else {
            throw Abort(.unauthorized)
        }
        
        let groupIds = try await user.getGroupsIds(on: req.db)
        return try await Graph.query(on: req.db)
            .filter(\.$groupOwner.$id ~~ groupIds)
            .all()
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
    
    func updateGraph(request req: Request, arguments: GraphTypes.UpdateGraphArguments) async throws -> Graph {
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
    }
}

class GraphTypes {
    struct NewGraphArguments: Codable {
        let graph: NewGraph
    }

    struct NewGraph: Codable {
        let groupOwnerId: UUID
        let name: String
        let kind: GraphKind
        let labelFilterId: UUID?
        let dateRange: GraphDateRange
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
    }

    protocol GraphResponse {}

    class Schema: PartialSchema<MrScroogeResolver, Request> {
        @TypeDefinitions
        override var types: Types {
            Enum(GraphKind.self)
            Enum(GraphGroupType.self)
            Enum(GraphDateRange.self)
            
            Type(Graph.self) {
                Field("id", at: \.id)
                Field("groupOwnerId", at: \.$groupOwner.id)
                Field("name", at: \.name)
                Field("kind", at: \.kind)
                Field("labelFilterId", at: \.$labelFilter.id)
                Field("dateRange", at: \.dateRange)
            }
            
           
            Union(GraphResponse.self, members: Graph.self, WrongOwnerId.self)
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
            Field("updateGraph", at: MrScroogeResolver.updateGraph) {
                Argument("graph", at: \.graph)
            }
        }
    }
}
extension Graph: GraphTypes.GraphResponse {}
extension WrongOwnerId: GraphTypes.GraphResponse{}

