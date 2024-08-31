@testable import App
import XCTest
import XCTVapor
import Vapor
import GraphQL
import Graphiti

class GraphTests: AbstractBaseTestsClass {
    
    let getGraphsQuery = """
    query {
      graphs {
        id
        name
        dateRange
        kind
        group {
          group
          hideOthers
          labels
        }
        horizontalGroup {
          group
          hideOthers
          labels
        }
      }
    }
    """
    
    let newGraphMutation = """
    mutation($graph: NewGraphInput!) {
      newGraph(graph: $graph) {
        __typename
        ... on Graph {
          id
          name
          dateRange
          kind
          group {
            group
            hideOthers
          }
        }
        ... on WrongOwnerId {
          validOwners
        }
      }
    }
    """
    
    let updateGraphMutation = """
    mutation($graph: UpdateGraphInput!) {
      updateGraph(graph: $graph) {
        __typename
        ... on Graph {
          id
          name
          dateRange
          kind
          group {
            group
            hideOthers
            labels
          }
          horizontalGroup {
            group
            hideOthers
            labels
          }
        }
        ... on InvalidGraph {
          availableGraphsId
        }
        ... on InvalidLabel {
          message
        }
      }
    }
    """
    
    let deleteGraphMutation = """
    mutation($graphId: Int!) {
      deleteGraph(graphId: $graphId) {
        __typename
        ... on Confirmation {
          message
        }
        ... on InvalidGraph {
          availableGraphsId
        }
      }
    }
    """
    
    func testGetGraphs() async throws {
        let app = try getApp()
        let labels = try labels.map({ try $0.requireID()})
        
        // Create test data
        let graph1 = Graph(groupOwnerId: testGroup.id!, name: "first", kind: .bar, dateRange: .all)
        let graph2 = Graph(groupOwnerId: testGroup.id!, name: "huge graph", kind: .line, dateRange: .oneYear)
        try await graph1.save(on: app.db)
        try await graph2.save(on: app.db)
        
        let group = GraphGroup(graphId: graph2.id!, group: .labels, hideOthers: false)
        try await group.save(on: app.db)
        try await GraphGroupLabels(graphId: group.id!, labelId: labels[1]).save(on: app.db)
        try await GraphGroupLabels(graphId: group.id!, labelId: labels[2]).save(on: app.db)
        

        let horizontalGroup = GraphHorizontalGroup(graphId: graph2.id!, group: .labels, hideOthers: true)
        try await horizontalGroup.save(on: app.db)
        try await GraphHorizontalGroupLabels(graphId: horizontalGroup.id!, labelId: labels[3]).save(on: app.db)
        try await GraphHorizontalGroupLabels(graphId: horizontalGroup.id!, labelId: labels[4]).save(on: app.db)
        
        

        let headers = try await app.getHeaders(forUser: SessionTypes.Credentials(username: testUser.username, password: "test-password"))
        
        let response = try await app.queryGql(GraphQLRequest(query: getGraphsQuery), headers: headers)
        
        let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)
        
        XCTAssertEqual(data.errors,  nil)
        
        print(data)
        
        let graphsData = data.data?["graphs"].array
        
        XCTAssertEqual(graphsData?.count, 2)
        
        let firstGraph = graphsData?[0]
        XCTAssertEqual(firstGraph?["name"].string, "first")
        
        let secondGraph = graphsData?[1]
        XCTAssertEqual(secondGraph?["name"].string, "huge graph")
        XCTAssertEqual(secondGraph?["dateRange"].string, "oneYear")
        XCTAssertEqual(secondGraph?["kind"].string, "line")
        
        let responseGroup = secondGraph?["group"]
        XCTAssertEqual(responseGroup?["group"].string, "labels")
        XCTAssertEqual(responseGroup?["hideOthers"].bool, false)
        XCTAssertEqual(responseGroup?["labels"].array?.compactMap { $0.int }, [1, 2])
        
        let responseHorizontalGroup = secondGraph?["horizontalGroup"]
        XCTAssertEqual(responseHorizontalGroup?["group"].string, "labels")
        XCTAssertEqual(responseHorizontalGroup?["hideOthers"].bool, true)
        XCTAssertEqual(responseHorizontalGroup?["labels"].array?.compactMap { $0.int }, [3, 4])
    }
    
    /*

    func testCreateNewGraph() async throws {
        let app = try getApp()
        
        let variables: [String: Codable] = [
            "graph": [
                "name": "New Graph",
                "groupOwnerId": testGroup.id!,
                "dateRange": "all",
                "kind": "bar",
                "group": [
                    "group": "month",
                    "hideOthers": false
                ]
            ]
        ]
        
        let headers = try await app.getHeaders(forUser: SessionTypes.Credentials(username: testUser.username, password: "test-password"))
        
        let response = try await app.queryGql(GraphQLRequest(query: newGraphMutation, variables: toVars(variables)), headers: headers)
        
        let data = try JSONDecoder().decode(GraphQLResponse<NewGraphResponse>.self, from: response.body)
        
        guard case .graph(let createdGraph) = data.data.newGraph else {
            XCTFail("Expected a Graph response")
            return
        }
        
        XCTAssertNotNil(createdGraph.id)
        XCTAssertEqual(createdGraph.name, "New Graph")
        XCTAssertEqual(createdGraph.dateRange, .all)
        XCTAssertEqual(createdGraph.kind, .bar)
        XCTAssertEqual(createdGraph.group?.group, .month)
        XCTAssertEqual(createdGraph.group?.hideOthers, false)
    }

    func testCreateNewGraphWithInvalidOwnerId() async throws {
        let app = try getApp()
        
        let variables: [String: Codable] = [
            "graph": [
                "name": "Invalid Graph",
                "groupOwnerId": 999, // Invalid owner ID
                "dateRange": "all",
                "kind": "bar",
                "group": [
                    "group": "month",
                    "hideOthers": false
                ]
            ]
        ]
        
        let headers = try await app.getHeaders(forUser: SessionTypes.Credentials(username: testUser.username, password: "test-password"))
        
        let response = try await app.queryGql(GraphQLRequest(query: newGraphMutation, variables: toVars(variables)), headers: headers)
        
        let data = try JSONDecoder().decode(GraphQLResponse<NewGraphResponse>.self, from: response.body)
        
        guard case .wrongOwnerId(let errorResponse) = data.data.newGraph else {
            XCTFail("Expected a WrongOwnerId response")
            return
        }
        
        XCTAssertEqual(errorResponse.validOwners, [testGroup.id!])
    }
    
    func testUpdateGraph() async throws {
        let app = try getApp()
        
        // Create an existing graph
        let existingGraph = Graph(name: "Original Graph", groupOwnerId: testGroup.id!, kind: .bar, dateRange: .all)
        try await existingGraph.save(on: app.db)
        
        let updatedGraph = UpdateGraph(
            id: existingGraph.id!,
            name: "Updated Graph",
            dateRange: .halfYear,
            kind: .line,
            group: GraphGroup(graphId: existingGraph.id!, group: .labels, hideOthers: false, labels: [2, 4]),
            horizontalGroup: GraphGroup(graphId: existingGraph.id!, group: .labels, hideOthers: true, labels: [3, 5])
        )
        
        let variables: [String: Codable] = ["graph": updatedGraph]
        
        let headers = try await app.getHeaders(forUser: SessionTypes.Credentials(username: testUser.username, password: "test-password"))
        
        let response = try await app.queryGql(GraphQLRequest(query: updateGraphMutation, variables: toVars(variables)), headers: headers)
        
        let data = try JSONDecoder().decode(GraphQLResponse<UpdateGraphResponse>.self, from: response.body)
        
        guard case .graph(let updatedGraphResponse) = data.data.updateGraph else {
            XCTFail("Expected a Graph response")
            return
        }
        
        XCTAssertEqual(updatedGraphResponse.id, existingGraph.id)
        XCTAssertEqual(updatedGraphResponse.name, "Updated Graph")
        XCTAssertEqual(updatedGraphResponse.dateRange, .halfYear)
        XCTAssertEqual(updatedGraphResponse.kind, .line)
        XCTAssertEqual(updatedGraphResponse.group?.group, .labels)
        XCTAssertEqual(updatedGraphResponse.group?.hideOthers, false)
        XCTAssertEqual(updatedGraphResponse.group?.labels, [2, 4])
        XCTAssertEqual(updatedGraphResponse.horizontalGroup?.group, .labels)
        XCTAssertEqual(updatedGraphResponse.horizontalGroup?.hideOthers, true)
        XCTAssertEqual(updatedGraphResponse.horizontalGroup?.labels, [3, 5])
    }
    
    func testDeleteGraph() async throws {
        let app = try getApp()
        
        // Create a graph to delete
        let graphToDelete = Graph(name: "Graph to Delete", groupOwnerId: testGroup.id!, kind: .bar, dateRange: .all)
        try await graphToDelete.save(on: app.db)
        
        let variables: [String: Codable] = ["graphId": graphToDelete.id!]
        
        let headers = try await app.getHeaders(forUser: SessionTypes.Credentials(username: testUser.username, password: "test-password"))
        
        let response = try await app.queryGql(GraphQLRequest(query: deleteGraphMutation, variables: toVars(variables)), headers: headers)
        
        let data = try JSONDecoder().decode(GraphQLResponse<DeleteGraphResponse>.self, from: response.body)
        
        guard case .confirmation(let confirmationResponse) = data.data.deleteGraph else {
            XCTFail("Expected a Confirmation response")
            return
        }
        
        XCTAssertEqual(confirmationResponse.message, "Graph deleted successfully")
        
        // Verify the graph is deleted
        let deletedGraph = try await Graph.find(graphToDelete.id!, on: app.db)
        XCTAssertNil(deletedGraph)
    }*/
}
