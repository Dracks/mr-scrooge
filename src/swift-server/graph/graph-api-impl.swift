
import OpenAPIRuntime
import OpenAPIVapor
import Foundation

let graphService = GraphService()
extension MrScroogeAPIImpl {
    func ApiGraphs_create(_ input: Operations.ApiGraphs_create.Input) async throws
        -> Operations.ApiGraphs_create.Output
    {
        let user = try await getUser(fromRequest: request)
        let validGroupsId = try user.groups.map{ return try $0.requireID() }
        var graphData : Components.Schemas.GraphParam
        switch(input.body){
        case .json(let _graphData):
            graphData = _graphData
        }
		
        guard let groupOwnerId = UUID(uuidString: graphData.groupOwnerId), validGroupsId.contains(groupOwnerId) else {
            return .unauthorized(.init(body: .json(.init(message: "Not valid groupOwnerId", code: ApiError.API10004.rawValue, validGroupOwners: validGroupsId.map{ $0.uuidString }))))
            
        }

		let data = try await graphService.createGraph(on: request.db, graphData)
        switch data {
        case let .invalidLabels(data: info):
            return .notFound(.init(body: .json(.init(message: "Invalid labels", code: ApiError.API10005.rawValue, validLabels: info.validLabels, invalidLabels: info.invalidLabels))))
        case let .ok(data: newGraph):
            return .created(.init(body: .json(newGraph)))
        }
    }
    
    func ApiGraphs_list(_ input: Operations.ApiGraphs_list.Input) async throws
        -> Operations.ApiGraphs_list.Output
    {
        let user = try await getUser(fromRequest: request)

        let validGroupsId = try user.groups.map{ return try $0.requireID() }
        
        var graphIds : [UUID]?
        if let inputGraphIds = input.query.graphIds {
            graphIds = inputGraphIds.map{UUID(uuidString: $0)!}
        }
        
        let data = try await graphService.getGraphs(
            on: request.db, pageQuery: .init(limit: input.query.limit ?? 100, cursor: input.query.cursor), groupsId: validGroupsId, graphsIds: graphIds)
        
        return .ok(.init(body: .json(.init(results: data.list, next: data.next))))
    }
    

    func ApiGraphs_update(_ input: Operations.ApiGraphs_update.Input) async throws
        -> Operations.ApiGraphs_update.Output
    {
        let user = try await getUser(fromRequest: request)
        let validGroupsId = try user.groups.map{ return try $0.requireID() }
        var graphData : Components.Schemas.GraphParam
        switch(input.body){
        case .json(let _graphData):
            graphData = _graphData
        }
        
        guard let groupOwnerId = UUID(uuidString: graphData.groupOwnerId), validGroupsId.contains(groupOwnerId) else {
            return .unauthorized(.init(body: .json(.init(message: "Not valid groupOwnerId", code: ApiError.API10004.rawValue, validGroupOwners: validGroupsId.map{ $0.uuidString }))))
            
        }
        
        guard let graphId = UUID(uuidString: input.path.id) else {
            print("InvalidGraphId")
            print(input.path.id)
            return .notFound(.init(body: .json(.init(value2: .init(message: "Id is not an uuid", code: ApiError.API10007.rawValue)))))
        }

        let data = try await graphService.updateGraph(on: request.db, withId: graphId, graph: graphData, forUser: user)
        switch data {
        case let .invalidLabels(data: info):
            return .notFound(.init(body: .json(.init(value1: .init(message: "Invalid labels", code: ApiError.API10006.rawValue, validLabels: info.validLabels, invalidLabels: info.invalidLabels)))))
        case let .notFound(graphId: graphId):
            return .notFound(.init(body: .json(.init(value2: .init(message: "Graph ID(\(graphId)) not found", code: ApiError.API10008.rawValue)))))
        case let .ok(data: newGraph):
            return .ok(.init(body: .json(newGraph)))
        }
    }


    func ApiGraphs_delete(_ input: Operations.ApiGraphs_delete.Input) async throws
        -> Operations.ApiGraphs_delete.Output
    {
        let user = try await getUser(fromRequest: request)
        guard let graphId = UUID(uuidString: input.path.id) else {
            return .notFound(.init(body: .json(.init(message: "Graph ID is not an UUID", code: ApiError.API10009.rawValue))))
        }

        let data = try await graphService.deleteGraph(
            on: request.db, graphId: graphId, forUser: user)
        switch data {
        case let .notFound(graphId: graphId):
            return .notFound(.init(body: .json(.init(message: "Graph ID \(graphId) not found", code: ApiError.API10010.rawValue))))
        case .ok:
            return .ok(.init(body: .json(.init())))
        }
    }
}
