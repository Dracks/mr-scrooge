import Fluent
import Vapor
/*
struct GraphController: RouteCollection {
    let graphService = GraphService()

    func boot(routes: RoutesBuilder) throws {
        let graphs = routes.grouped("graphs")
        graphs.get(use: getGraphs)
        graphs.post(use: createGraph)
        graphs.put(use: updateGraph)
        graphs.delete(":graphId", use: deleteGraph)
    }

    func getGraphs(req: Request) async throws -> [Graph] {
        guard let user = req.auth.get(User.self) else {
            throw Abort(.unauthorized)
        }

        let groupIds = try await user.getGroupsIds(on: req.db)
        let graphIds = try? req.query.decode([UUID].self)
        return try await graphService.getGraphs(on: req.db, groupsId: groupIds, graphsIds: graphIds)
    }

    func createGraph(req: Request) async throws -> GraphResponse {
        guard let user = req.auth.get(User.self) else {
            throw Abort(.unauthorized)
        }

        let newGraph = try req.content.decode(NewGraph.self)
        let userGroupIds = try await user.getGroupsIds(on: req.db)
        
        guard userGroupIds.contains(newGraph.groupOwnerId) else {
            return WrongOwnerId(validOwners: userGroupIds)
        }

        return try await graphService.createGraph(on: req.db, newGraph)
    }

    func updateGraph(req: Request) async throws -> UpdateGraphResponse {
        guard let user = req.auth.get(User.self) else {
            throw Abort(.unauthorized)
        }

        let updateGraph = try req.content.decode(UpdateGraph.self)
        let userGroupIds = try await user.getGroupsIds(on: req.db)
        
        guard userGroupIds.contains(updateGraph.groupOwnerId) else {
            return WrongOwnerId(validOwners: userGroupIds)
        }

        return try await graphService.updateGraph(on: req.db, graph: updateGraph, forUser: user)
    }

    func deleteGraph(req: Request) async throws -> DeleteGraphResponse {
        guard let user = req.auth.get(User.self) else {
            throw Abort(.unauthorized)
        }

        guard let graphId = req.parameters.get("graphId", as: UUID.self) else {
            throw Abort(.badRequest)
        }

        return try await graphService.deleteGraph(on: req.db, graphId: graphId, forUser: user)
    }

    // MARK: - Types

    struct Graph: Codable {
        let id: UUID
        let groupOwnerId: UUID
        let name: String
        let kind: GraphKind
        let labelFilterId: UUID?
        let dateRange: GraphDateRange
        let group: Group
        let horizontalGroup: HorizontalGroup?
    }

    struct Group: Codable {
        let group: GraphGroupType
        let hideOthers: Bool?
        var labels: [UUID]?
    }

    struct HorizontalGroup: Group {
        let accumulate: Bool?
    }

    struct NewGraph: Codable {
        let groupOwnerId: UUID
        let name: String
        let kind: GraphKind
        let labelFilterId: UUID?
        let dateRange: GraphDateRange
        let group: Group
        let horizontalGroup: HorizontalGroup?
    }

    struct UpdateGraph: Codable {
        let id: UUID
        let name: String
        let kind: GraphKind
        let labelFilterId: UUID?
        let dateRange: GraphDateRange
        let groupOwnerId: UUID
        let group: Group
        let horizontalGroup: HorizontalGroup?
    }

    struct GraphNotFound: Codable, UpdateGraphResponse, DeleteGraphResponse {
        let graphId: UUID
    }
}

*/
