import Fluent
import OpenAPIRuntime
import OpenAPIVapor
import Vapor
import XCTVapor
import XCTest

@testable import MrScroogeServer

class GraphTests: AbstractBaseTestsClass {

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
		try await GraphGroup(
			graphId: graph1.requireID(), group: .day, hideOthers: false
		).save(
			on: app.db)

		let group = try GraphGroup(
			graphId: graph2.requireID(), group: .labels,
			hideOthers: false)
		try await group.save(on: app.db)
		try await GraphGroupLabels(
			graphId: graph2.requireID(), labelId: labels[1],
			order: 1
		).save(
			on: app.db)
		try await GraphGroupLabels(
			graphId: graph2.requireID(), labelId: labels[2], order: 2
		).save(
			on: app.db)

		let horizontalGroup = GraphHorizontalGroup(
			graphId: graph2.id!, group: .labels, hideOthers: true)
		try await horizontalGroup.save(on: app.db)
		try await GraphHorizontalGroupLabels(
			graphId: graph2.requireID(), labelId: labels[3], order: 4
		).save(on: app.db)
		try await GraphHorizontalGroupLabels(
			graphId: graph2.requireID(), labelId: labels[4], order: 1
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
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(.GET, "/api/graphs", headers: headers)

		XCTAssertEqual(response.status, .ok)
		let data = try response.content.decode(
			Operations.ApiGraphs_list.Output.Ok.Body.jsonPayload.self)

		let fistLabelsIds = [1, 2].map { labels[$0].uuidString }
		let secondLabelsIds = [4, 3].map { labels[$0].uuidString }

		let graphsData = data.results

		XCTAssertEqual(graphsData.count, 2)

		let firstGraph = graphsData.first
		XCTAssertEqual(firstGraph?.name, "first")

		let secondGraph = graphsData[1]
		XCTAssertEqual(secondGraph.name, "huge graph")
		XCTAssertEqual(secondGraph.dateRange, .oneYear)
		XCTAssertEqual(secondGraph.kind, .line)

		let responseGroup = secondGraph.group
		XCTAssertEqual(responseGroup.group, .labels)
		XCTAssertEqual(responseGroup.hideOthers, false)
		XCTAssertEqual(responseGroup.labels, fistLabelsIds)

		let responseHorizontalGroup = secondGraph.horizontalGroup
		XCTAssertEqual(responseHorizontalGroup?.group, .labels)
		XCTAssertEqual(responseHorizontalGroup?.hideOthers, true)
		XCTAssertEqual(responseHorizontalGroup?.labels, secondLabelsIds)

	}

	func testGetOneGraphs() async throws {
		let app = try getApp()

		let labels = try labels.map({ try $0.requireID() })

		try await generateGraphs()

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(
			.GET, "/api/graphs/?graphIds=\(testIds["graph"]!)",
			headers: headers)

		XCTAssertEqual(response.status, .ok)
		let data = try response.content.decode(
			Operations.ApiGraphs_list.Output.Ok.Body.jsonPayload.self)

		let fistLabelsIds = [1, 2].map { labels[$0].uuidString }
		let secondLabelsIds = [4, 3].map { labels[$0].uuidString }

		let graphsData = data.results

		XCTAssertEqual(graphsData.count, 1)

		let secondGraph = graphsData.first
		XCTAssertEqual(secondGraph?.name, "huge graph")
		XCTAssertEqual(secondGraph?.dateRange, .oneYear)
		XCTAssertEqual(secondGraph?.kind, .line)

		let responseGroup = secondGraph?.group
		XCTAssertEqual(responseGroup?.group, .labels)
		XCTAssertEqual(responseGroup?.hideOthers, false)
		XCTAssertEqual(responseGroup?.labels, fistLabelsIds)

		let responseHorizontalGroup = secondGraph?.horizontalGroup
		XCTAssertEqual(responseHorizontalGroup?.group, .labels)
		XCTAssertEqual(responseHorizontalGroup?.hideOthers, true)
		XCTAssertEqual(responseHorizontalGroup?.labels, secondLabelsIds)

	}

	func testCreateNewGraph() async throws {

		let app = try getApp()

		let updateGraph = Components.Schemas.GraphParam(
			groupOwnerId: testGroup.id!.uuidString,
			name: "New Graph",
			kind: .bar,
			dateRange: .all,
			group: .init(group: .month, hideOthers: false, labels: nil)
		)

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(
			.POST, "/api/graphs", body: updateGraph, headers: headers)

		XCTAssertEqual(response.status, .created)

		let createdGraph = try response.content.decode(Components.Schemas.Graph.self)

		XCTAssertNotNil(createdGraph.id)
		XCTAssertEqual(createdGraph.name, "New Graph")
		XCTAssertEqual(createdGraph.dateRange, .all)
		XCTAssertEqual(createdGraph.kind, .bar)
		XCTAssertEqual(createdGraph.group.group, .month)
		XCTAssertEqual(createdGraph.group.hideOthers, false)

	}

	func testCreateNewGraphWithInvalidOwnerId() async throws {
		let app = try getApp()

		let updateGraph = Components.Schemas.GraphParam(
			groupOwnerId: testGroup2.id!.uuidString,
			name: "New Graph",
			kind: .bar,
			dateRange: .all,
			group: .init(group: .month, hideOthers: false, labels: nil))

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(
			.POST, "/api/graphs", body: updateGraph, headers: headers)

		XCTAssertEqual(response.status, .forbidden)

		let data = try response.content.decode(Components.Schemas.InvalidGroupOwnerId.self)

		XCTAssertNotNil(data)
		XCTAssertEqual(data.code, "API10004")
	}

	func testUpdateGraph() async throws {
		let app = try getApp()
		let labels = try labels.map({ try $0.requireID().uuidString })

		// Create an existing graph

		try await generateGraphs()

		let updateGraph = Components.Schemas.GraphParam(
			groupOwnerId: testGroup.id!.uuidString,
			name: "Updated Graph",
			kind: .line,
			dateRange: .halfYear,
			group: .init(
				group: .labels, hideOthers: false, labels: [labels[2], labels[4]]),
			horizontalGroup: .init(
				group: .labels, hideOthers: true, labels: [labels[3], labels[5]]))

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(
			.PUT, "/api/graphs/\(testIds["graph"]!)", body: updateGraph,
			headers: headers)

		XCTAssertEqual(response.status, .ok)

		let updatedGraph = try response.content.decode(Components.Schemas.Graph.self)

		XCTAssertEqual(updatedGraph.id, testIds["graph"]!.uuidString)
		XCTAssertEqual(updatedGraph.name, "Updated Graph")
		XCTAssertEqual(updatedGraph.dateRange, .halfYear)
		XCTAssertEqual(updatedGraph.kind, .line)
		XCTAssertEqual(updatedGraph.group.group, .labels)
		XCTAssertEqual(updatedGraph.group.hideOthers, false)
		XCTAssertEqual(
			updatedGraph.group.labels,
			[2, 4].map({ labels[$0] }))
		XCTAssertEqual(
			updatedGraph.horizontalGroup?.group, .labels)
		XCTAssertEqual(updatedGraph.horizontalGroup?.hideOthers, true)
		XCTAssertEqual(
			updatedGraph.horizontalGroup?.labels,
			[3, 5].map({ labels[$0] }))
	}

	func testUpdateGraphWithInvalidLabels() async throws {
		let app = try getApp()
		let labels = try labels.map({ try $0.requireID().uuidString })

		// Create an existing graph
		try await generateGraphs()

		let updatedGraph = Components.Schemas.GraphParam(
			groupOwnerId: testGroup.id!.uuidString, name: "Updated Graph", kind: .line,
			dateRange: .halfYear,
			group: .init(
				group: .labels, hideOthers: false,
				labels: [labels[2], labels[4], labels[11]]),
			horizontalGroup: .init(
				group: .labels, hideOthers: true,
				labels: [labels[3], labels[5], labels[12]]))

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(
			.PUT, "/api/graphs/\(testIds["graph"]!)", body: updatedGraph,
			headers: headers)

		XCTAssertEqual(response.status, .notFound)

		let notFoundLabels = try response.content.decode(
			Components.Schemas.NotFoundLabels.self)

		XCTAssertEqual(notFoundLabels.validLabels.count, 4)
		XCTAssertEqual(notFoundLabels.invalidLabels.count, 2)
		let validLabels = [1, 2, 3, 4].map({ labels[$0] })
		XCTAssertTrue(
			notFoundLabels.validLabels.contains(where: {
				validLabels.contains($0)
			}))

		let invalidLabels = [11, 12].map({ labels[$0] })
		XCTAssertTrue(
			notFoundLabels.invalidLabels.contains(where: {
				invalidLabels.contains($0)
			}))

	}
	// Todo add a test to try to update a not existing graph
	func testUpdateNonExistingGraph() async throws {
		let app = try getApp()
		let labels = try labels.map({ try $0.requireID().uuidString })

		// Create a non-existing graph ID
		let nonExistingGraphId = UUID()

		let updateGraph = Components.Schemas.GraphParam(
			groupOwnerId: testGroup.id!.uuidString,
			name: "Non-Existing Graph",
			kind: .line,
			dateRange: .halfYear,
			group: .init(
				group: .labels, hideOthers: false, labels: [labels[0], labels[1]]),
			horizontalGroup: .init(
				group: .labels, hideOthers: true, labels: [labels[2], labels[3]]))

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(
			.PUT, "/api/graphs/\(nonExistingGraphId)", body: updateGraph,
			headers: headers)

		XCTAssertEqual(response.status, .notFound)

		let data = try response.content.decode(Components.Schemas._Error.self)

		XCTAssertNotNil(data)
		XCTAssertEqual(data.code, "API10008")
		/*
		ToDo: check and transform when needed
		let result = data.data?["updateGraph"]
		XCTAssertEqual(result?["__typename"].string, "GraphNotFound")
		XCTAssertEqual(result?["graphId"].string, nonExistingGraphId.uuidString)
		*/
	}

	func testDeleteGraph() async throws {
		let app = try getApp()

		// Generate test graphs
		try await generateGraphs()

		let graphId = testIds["graph"]!

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(
			.DELETE, "/api/graphs/\(graphId)", headers: headers)

		XCTAssertEqual(response.status, .ok)

		let data = try response.content.decode(Bool.self)

		XCTAssertEqual(data, true)

		let count = try await Graph.query(on: app.db).filter(\.$id == graphId).count()
		XCTAssertEqual(count, 0)
	}

	func testDeleteInvalidGraph() async throws {
		let app = try getApp()

		let invalidGraphId = UUID()

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(
			.DELETE, "/api/graphs/\(invalidGraphId)", headers: headers)

		XCTAssertEqual(response.status, .notFound)

		let data = try response.content.decode(Components.Schemas._Error.self)

		XCTAssertEqual(data.code, "API10010")
	}

	func testDeleteGraphNotOwned() async throws {
		let app = try getApp()

		// Generate test graphs
		try await generateGraphs()

		let notOwnedGraphId = testIds["otherOwnerGraph"]!

		let headers = try await app.getHeaders(
			forUser: .init(
				username: testUser.username, password: "test-password"))

		let response = try await app.sendRequest(
			.DELETE, "/api/graphs/\(notOwnedGraphId)", headers: headers)

		XCTAssertEqual(response.status, .notFound)

		let data = try response.content.decode(Components.Schemas._Error.self)

		XCTAssertEqual(data.code, "API10010")
	}

}
