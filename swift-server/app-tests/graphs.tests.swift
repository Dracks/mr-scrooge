import GraphQL
import Graphiti
import Vapor
import XCTVapor
import XCTest

@testable import App

class GraphTests: AbstractBaseTestsClass {

	let getGraphsQuery = """
		query($graphIds: [UUID!]) {
		  graphs(graphIds: $graphIds) {
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
		mutation($graph: NewGraph!) {
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
		    ... on InvalidLabels {
		      validLabels
		      invalidLabels
		    }
		  }
		}
		"""

	let updateGraphMutation = """
		mutation($graph: UpdateGraph!) {
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
		    ... on InvalidLabels {
		      validLabels
		      invalidLabels
		    }
		    ... on WrongOwnerId {
		      validOwners
		    }
		    ... on GraphNotFound {
		      graphId
		    }
		  }
		}
		"""

	let deleteGraphMutation = """
		mutation($graphId: UUID!) {
		  deleteGraph(graphId: $graphId) {
		    __typename
		    ... on DeleteConfirmation {
		      confirm
		    }
		    ... on GraphNotFound {
		      graphId
		    }
		  }
		}
		"""

	func generateGraphs() async throws {
		let app = try getApp()
		let labels = try labels.map({ try $0.requireID() })

		// Create test data
		let graph1 = Graph(
			groupOwnerId: testGroup.id!, name: "first", kind: .bar, dateRange: .all)
		let graph2 = Graph(
			groupOwnerId: testGroup.id!, name: "huge graph", kind: .line,
			dateRange: .oneYear)
		try await graph1.save(on: app.db)
		try await graph2.save(on: app.db)
		try await GraphGroup(graphId: graph1.id!, group: .day, hideOthers: false).save(
			on: app.db)

		let group = GraphGroup(graphId: graph2.id!, group: .labels, hideOthers: false)
		try await group.save(on: app.db)
		try await GraphGroupLabels(graphId: graph2.id!, labelId: labels[1], order: 1).save(
			on: app.db)
		try await GraphGroupLabels(graphId: graph2.id!, labelId: labels[2], order: 2).save(
			on: app.db)

		let horizontalGroup = GraphHorizontalGroup(
			graphId: graph2.id!, group: .labels, hideOthers: true)
		try await horizontalGroup.save(on: app.db)
		try await GraphHorizontalGroupLabels(
			graphId: graph2.id!, labelId: labels[3], order: 4
		).save(on: app.db)
		try await GraphHorizontalGroupLabels(
			graphId: graph2.id!, labelId: labels[4], order: 1
		).save(on: app.db)

		// Other owner graph
		let graph3 = Graph(
			groupOwnerId: testGroup2.id!, name: "huge graph", kind: .line,
			dateRange: .oneYear)
		try await graph3.save(on: app.db)
		try await GraphGroup(graphId: graph3.id!, group: .day, hideOthers: false).save(
			on: app.db)

		testIds["graph"] = try graph2.requireID()
		testIds["otherOwnerGraph"] = try graph3.requireID()

	}

	func testGetGraphs() async throws {
		let app = try getApp()

		let labels = try labels.map({ try $0.requireID() })

		try await generateGraphs()

		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let response = try await app.queryGql(
			GraphQLRequest(query: getGraphsQuery), headers: headers)

		let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)

		XCTAssertEqual(data.errors, [])

		let fistLabelsIds = try [1, 2].map { try Map(labels[$0]) }
		let secondLabelsIds = try [4, 3].map { try Map(labels[$0]) }

		let graphsData = data.data?["graphs"].array

		XCTAssertEqual(graphsData?.count, 2)

		let firstGraph = graphsData?[0]
		XCTAssertEqual(firstGraph?["name"].string, "first")

		let secondGraph = graphsData?[1]
		XCTAssertEqual(secondGraph?["name"].string, "huge graph")
		XCTAssertEqual(secondGraph?["dateRange"].string, "year")
		XCTAssertEqual(secondGraph?["kind"].string, "line")

		let responseGroup = secondGraph?["group"]
		XCTAssertEqual(responseGroup?["group"].string, "labels")
		XCTAssertEqual(responseGroup?["hideOthers"].bool, false)
		XCTAssertEqual(responseGroup?["labels"].array!, fistLabelsIds)

		let responseHorizontalGroup = secondGraph?["horizontalGroup"]
		XCTAssertEqual(responseHorizontalGroup?["group"].string, "labels")
		XCTAssertEqual(responseHorizontalGroup?["hideOthers"].bool, true)
		XCTAssertEqual(responseHorizontalGroup?["labels"].array!, secondLabelsIds)

	}

	func testGetOneGraphs() async throws {
		let app = try getApp()

		let labels = try labels.map({ try $0.requireID() })

		try await generateGraphs()

		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let response = try await app.queryGql(
			GraphQLRequest(
				query: getGraphsQuery,
				variables: toVars(["graphIds": [testIds["graph"]!]])),
			headers: headers)

		let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)

		XCTAssertEqual(data.errors, [])

		let fistLabelsIds = try [1, 2].map { try Map(labels[$0]) }
		let secondLabelsIds = try [4, 3].map { try Map(labels[$0]) }

		let graphsData = data.data?["graphs"].array

		XCTAssertEqual(graphsData?.count, 1)

		let secondGraph = graphsData?[0]
		XCTAssertEqual(secondGraph?["name"].string, "huge graph")
		XCTAssertEqual(secondGraph?["dateRange"].string, "year")
		XCTAssertEqual(secondGraph?["kind"].string, "line")

		let responseGroup = secondGraph?["group"]
		XCTAssertEqual(responseGroup?["group"].string, "labels")
		XCTAssertEqual(responseGroup?["hideOthers"].bool, false)
		XCTAssertEqual(responseGroup?["labels"].array!, fistLabelsIds)

		let responseHorizontalGroup = secondGraph?["horizontalGroup"]
		XCTAssertEqual(responseHorizontalGroup?["group"].string, "labels")
		XCTAssertEqual(responseHorizontalGroup?["hideOthers"].bool, true)
		XCTAssertEqual(responseHorizontalGroup?["labels"].array!, secondLabelsIds)

	}

	func testCreateNewGraph() async throws {

		let app = try getApp()

		let variables = try map(
			from: [
				"name": "New Graph",
				"groupOwnerId": testGroup.id!,
				"dateRange": "all",
				"kind": "bar",
				"group": [
					"group": "month",
					"hideOthers": false,
				].toOrdered(),
			].toOrdered())

		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let response = try await app.queryGql(
			GraphQLRequest(query: newGraphMutation, variables: ["graph": variables]),
			headers: headers)

		let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)
		XCTAssertEqual(data.errors, [])

		let createdGraph = data.data?["newGraph"]

		XCTAssertNotNil(createdGraph?["id"])
		XCTAssertEqual(createdGraph?["__typename"].string, "Graph")
		XCTAssertEqual(createdGraph?["name"].string, "New Graph")
		XCTAssertEqual(createdGraph?["dateRange"].string, GraphDateRange.all.rawValue)
		XCTAssertEqual(createdGraph?["kind"].string, GraphKind.bar.rawValue)
		XCTAssertEqual(
			createdGraph?["group"]["group"].string, GraphGroupType.month.rawValue)
		XCTAssertEqual(createdGraph?["group"]["hideOthers"].bool, false)

	}

	func testCreateNewGraphWithInvalidOwnerId() async throws {
		let app = try getApp()

		let variables = try map(
			from: [
				"name": "Invalid Graph",
				"groupOwnerId": try testGroup2.requireID(),  // Invalid owner ID
				"dateRange": "all",
				"kind": "bar",
				"group": [
					"group": "month",
					"hideOthers": false,
				].toOrdered(),
			].toOrdered()
		)

		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let response = try await app.queryGql(
			GraphQLRequest(query: newGraphMutation, variables: ["graph": variables]),
			headers: headers)

		let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)
		XCTAssertEqual(data.errors, [])

		let createdGraph = data.data?["newGraph"]
		XCTAssertEqual(createdGraph?["__typename"].string, "WrongOwnerId")
		XCTAssertEqual(
			createdGraph?["validOwners"].array!, [try map(from: testGroup.requireID())])

	}

	func testUpdateGraph() async throws {
		let app = try getApp()
		let labels = try labels.map({ try $0.requireID() })

		// Create an existing graph

		try await generateGraphs()

		let updatedGraph = try map(
			from: [
				"id": testIds["graph"]!,
				"name": "Updated Graph",
				"dateRange": GraphDateRange.halfYear.rawValue,
				"kind": GraphKind.line.rawValue,
				"groupOwnerId": try testGroup.requireID(),
				"group": [
					"group": GraphGroupType.labels.rawValue,
					"hideOthers": false,
					"labels": [labels[2], labels[4]],
				].toOrdered(),
				"horizontalGroup": [
					"group": GraphGroupType.labels.rawValue,
					"hideOthers": true,
					"labels": [labels[3], labels[5]],
				].toOrdered(),
			].toOrdered())

		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let response = try await app.queryGql(
			GraphQLRequest(
				query: updateGraphMutation, variables: ["graph": updatedGraph]),
			headers: headers)

		let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)
		XCTAssertEqual(data.errors, [])
		print(data)
		let createdGraph = data.data?["updateGraph"]

		XCTAssertEqual(createdGraph?["id"].string, testIds["graph"]!.uuidString)
		XCTAssertEqual(createdGraph?["name"].string, "Updated Graph")
		XCTAssertEqual(createdGraph?["dateRange"].string, GraphDateRange.halfYear.rawValue)
		XCTAssertEqual(createdGraph?["kind"].string, GraphKind.line.rawValue)
		XCTAssertEqual(
			createdGraph?["group"]["group"].string, GraphGroupType.labels.rawValue)
		XCTAssertEqual(createdGraph?["group"]["hideOthers"].bool, false)
		XCTAssertEqual(
			createdGraph?["group"]["labels"].array!,
			try [2, 4].map({ try map(from: labels[$0]) }))
		XCTAssertEqual(
			createdGraph?["horizontalGroup"]["group"].string,
			GraphGroupType.labels.rawValue)
		XCTAssertEqual(createdGraph?["horizontalGroup"]["hideOthers"].bool, true)
		XCTAssertEqual(
			createdGraph?["horizontalGroup"]["labels"].array!,
			try [3, 5].map({ try map(from: labels[$0]) }))
	}

	func testUpdateGraphWithInvalidLabels() async throws {
		let app = try getApp()
		let labels = try labels.map({ try $0.requireID() })

		// Create an existing graph
		try await generateGraphs()

		let updatedGraph = try map(
			from: [
				"id": testIds["graph"]!,
				"name": "Updated Graph",
				"dateRange": GraphDateRange.halfYear.rawValue,
				"kind": GraphKind.line.rawValue,
				"groupOwnerId": try testGroup.requireID(),
				"group": [
					"group": GraphGroupType.labels.rawValue,
					"hideOthers": false,
					"labels": [labels[2], labels[4], labels[11]],
				].toOrdered(),
				"horizontalGroup": [
					"group": GraphGroupType.labels.rawValue,
					"hideOthers": true,
					"labels": [labels[3], labels[5], labels[12]],
				].toOrdered(),
			].toOrdered())

		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let response = try await app.queryGql(
			GraphQLRequest(
				query: updateGraphMutation, variables: ["graph": updatedGraph]),
			headers: headers)

		let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)
		XCTAssertEqual(data.errors, [])

		let createdGraph = data.data?["updateGraph"]
		XCTAssertEqual(createdGraph?["__typename"].string, "InvalidLabels")
		XCTAssertEqual(createdGraph?["validLabels"].array?.count, 4)
		XCTAssertEqual(createdGraph?["invalidLabels"].array?.count, 2)
		let validLabels = try [1, 2, 3, 4].map({ try map(from: labels[$0]) })
		XCTAssertTrue(
			createdGraph?["validLabels"].array?.contains(where: {
				validLabels.contains($0)
			}) ?? false)

		let invalidLabels = try [11, 12].map({ try map(from: labels[$0]) })
		XCTAssertTrue(
			createdGraph?["invalidLabels"].array?.contains(where: {
				invalidLabels.contains($0)
			}) ?? false)

	}
	// Todo add a test to try to update a not existing graph
	func testUpdateNonExistingGraph() async throws {
		let app = try getApp()
		let labels = try labels.map({ try $0.requireID() })

		// Create a non-existing graph ID
		let nonExistingGraphId = UUID()

		let updatedGraph = try map(
			from: [
				"id": nonExistingGraphId,
				"name": "Non-Existing Graph",
				"dateRange": GraphDateRange.halfYear.rawValue,
				"kind": GraphKind.line.rawValue,
				"groupOwnerId": try testGroup.requireID(),
				"group": [
					"group": GraphGroupType.labels.rawValue,
					"hideOthers": false,
					"labels": [labels[0], labels[1]],
				].toOrdered(),
				"horizontalGroup": [
					"group": GraphGroupType.labels.rawValue,
					"hideOthers": true,
					"labels": [labels[2], labels[3]],
				].toOrdered(),
			].toOrdered())

		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let response = try await app.queryGql(
			GraphQLRequest(
				query: updateGraphMutation, variables: ["graph": updatedGraph]),
			headers: headers)

		let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)
		XCTAssertEqual(data.errors, [])

		let result = data.data?["updateGraph"]
		XCTAssertEqual(result?["__typename"].string, "GraphNotFound")
		XCTAssertEqual(result?["graphId"].string, nonExistingGraphId.uuidString)
	}

	func testDeleteGraph() async throws {
		let app = try getApp()

		// Generate test graphs
		try await generateGraphs()

		let graphId = testIds["graph"]!

		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let response = try await app.queryGql(
			GraphQLRequest(
				query: deleteGraphMutation,
				variables: ["graphId": map(from: graphId)]), headers: headers)

		let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)
		XCTAssertEqual(data.errors, [])

		let result = data.data?["deleteGraph"]
		XCTAssertEqual(result?["__typename"].string, "DeleteConfirmation")
		XCTAssertNotNil(result?["confirm"].bool)

		// Verify the graph is deleted
		//let graphService = try app.make(GraphService.self)
		//XCTAssertThrowsError(try await graphService.getGraphById(graphId))
	}

	func testDeleteInvalidGraph() async throws {
		let app = try getApp()

		let invalidGraphId = UUID()

		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let response = try await app.queryGql(
			GraphQLRequest(
				query: deleteGraphMutation,
				variables: ["graphId": map(from: invalidGraphId)]), headers: headers
		)

		let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)
		XCTAssertEqual(data.errors, [])

		let result = data.data?["deleteGraph"]
		XCTAssertEqual(result?["__typename"].string, "GraphNotFound")
		// XCTAssertNotNil(result?["availableGraphsId"].array)
	}

	func testDeleteGraphNotOwned() async throws {
		let app = try getApp()

		// Generate test graphs
		try await generateGraphs()

		let notOwnedGraphId = testIds["otherOwnerGraph"]!

		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let response = try await app.queryGql(
			GraphQLRequest(
				query: deleteGraphMutation,
				variables: ["graphId": map(from: notOwnedGraphId)]),
			headers: headers)

		let data = try JSONDecoder().decode(GraphQLResult.self, from: response.body)
		XCTAssertEqual(data.errors, [])

		let result = data.data?["deleteGraph"]
		XCTAssertEqual(result?["__typename"].string, "GraphNotFound")
		// XCTAssertNotNil(result?["availableGraphsId"].array)
	}
}
