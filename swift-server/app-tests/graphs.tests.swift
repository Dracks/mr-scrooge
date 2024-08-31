@testable import App
import XCTest
import XCTVapor
import Vapor

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
    
    func testGetGraphs() async throws {
        let app = try getApp()
        
        // Create test data
        let graph1 = Graph(name: "first", groupOwnerId: testGroup.id!)
        let graph2 = Graph(name: "huge graph", groupOwnerId: testGroup.id!, dateRange: .oneYear, kind: .line)
        graph2.group = GraphGroup(group: .labels, hideOthers: false, labels: [1, 2])
        graph2.horizontalGroup = GraphGroup(group: .labels, hideOthers: true, labels: [3, 4])
        
        try await graph1.save(on: app.db)
        try await graph2.save(on: app.db)

        let headers = try await app.getHeaders(forUser: SessionTypes.Credentials(username: testUser.username, password: "test-password"))
        
        let response = try await app.queryGql(GraphQLRequest(query: getGraphsQuery), headers: headers)
        
        let data = try JSONDecoder().decode(GraphQLResponse<GraphsResponse>.self, from: response.body)
        
        XCTAssertEqual(data.data.graphs.count, 2)
        
        let firstGraph = data.data.graphs[0]
        XCTAssertEqual(firstGraph.name, "first")
        
        let secondGraph = data.data.graphs[1]
        XCTAssertEqual(secondGraph.name, "huge graph")
        XCTAssertEqual(secondGraph.dateRange, .oneYear)
        XCTAssertEqual(secondGraph.kind, .line)
        XCTAssertEqual(secondGraph.group?.group, .labels)
        XCTAssertEqual(secondGraph.group?.hideOthers, false)
        XCTAssertEqual(secondGraph.group?.labels, [1, 2])
        XCTAssertEqual(secondGraph.horizontalGroup?.group, .labels)
        XCTAssertEqual(secondGraph.horizontalGroup?.hideOthers, true)
        XCTAssertEqual(secondGraph.horizontalGroup?.labels, [3, 4])
    }

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
}

