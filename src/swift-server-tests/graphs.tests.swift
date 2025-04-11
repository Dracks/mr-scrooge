import Fluent
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("Graph Tests")
final class GraphTests: BaseWithFactories {

	private func generateGraphs(
		app: Application, data testData: GroupsAndUsers, labels: [Label]
	) async throws -> (
		Graph, Graph, Graph
	) {
		let labels = try labels.map({ try $0.requireID() })

		// Create test data
		let graph1 = Graph(
			groupOwnerId: testData.group.id!, name: "first", kind: .bar,
			dateRange: .all,
			order: 0)
		let graph2 = Graph(
			groupOwnerId: testData.group.id!, name: "huge graph", kind: .line,
			dateRange: .oneYear,
			order: 1)
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
		let graph3 = try Graph(
			groupOwnerId: testData.group2.requireID(), name: "huge graph", kind: .line,
			dateRange: .oneYear,
			order: 0)
		try await graph3.save(on: app.db)
		try await GraphGroup(graphId: graph3.id!, group: .day, hideOthers: false).save(
			on: app.db)

		return (graph1, graph2, graph3)
	}

	@Test("Get all graphs")
	func testGetGraphs() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let _ = try await generateGraphs(
				app: app, data: testData, labels: labels)
			let labelIds = try labels.map({ try $0.requireID() })

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.GET, "/api/graphs", headers: headers)

			#expect(response.status == .ok)
			let data = try response.content.decode(
				Operations.ApiGraphs_list.Output.Ok.Body.jsonPayload.self)

			let fistLabelsIds = [1, 2].map { labelIds[$0].uuidString }
			let secondLabelsIds = [4, 3].map { labelIds[$0].uuidString }

			let graphsData = data.results

			#expect(graphsData.count == 2)

			let firstGraph = graphsData.first
			#expect(firstGraph?.name == "first")

			let secondGraph = graphsData[1]
			#expect(secondGraph.name == "huge graph")
			#expect(secondGraph.dateRange == .oneYear)
			#expect(secondGraph.kind == .line)

			let responseGroup = secondGraph.group
			#expect(responseGroup.group == .labels)
			#expect(responseGroup.hideOthers == false)
			#expect(responseGroup.labels == fistLabelsIds)

			let responseHorizontalGroup = secondGraph.horizontalGroup
			#expect(responseHorizontalGroup?.group == .labels)
			#expect(responseHorizontalGroup?.hideOthers == true)
			#expect(responseHorizontalGroup?.labels == secondLabelsIds)
		}
	}

	@Test("Get single graph")
	func testGetOneGraphs() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)

			let labels = try await createTestLabels(app: app, testData: testData)
			let (_, graph2, _) = try await generateGraphs(
				app: app, data: testData, labels: labels)
			let labelIds = try labels.map({ try $0.requireID() })

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.GET, "/api/graphs/?graphIds=\(graph2.requireID())",
				headers: headers)

			#expect(response.status == .ok)
			let data = try response.content.decode(
				Operations.ApiGraphs_list.Output.Ok.Body.jsonPayload.self)

			let fistLabelsIds = [1, 2].map { labelIds[$0].uuidString }
			let secondLabelsIds = [4, 3].map { labelIds[$0].uuidString }

			let graphsData = data.results

			#expect(graphsData.count == 1)

			let secondGraph = graphsData.first
			#expect(secondGraph?.name == "huge graph")
			#expect(secondGraph?.dateRange == .oneYear)
			#expect(secondGraph?.kind == .line)

			let responseGroup = secondGraph?.group
			#expect(responseGroup?.group == .labels)
			#expect(responseGroup?.hideOthers == false)
			#expect(responseGroup?.labels == fistLabelsIds)

			let responseHorizontalGroup = secondGraph?.horizontalGroup
			#expect(responseHorizontalGroup?.group == .labels)
			#expect(responseHorizontalGroup?.hideOthers == true)
			#expect(responseHorizontalGroup?.labels == secondLabelsIds)
		}
	}

	@Test("Create new graph")
	func testCreateNewGraph() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let updateGraph = Components.Schemas.GraphInput(
				groupOwnerId: testData.group.id!.uuidString,
				name: "New Graph",
				kind: .bar,
				dateRange: .all,
				group: .init(group: .month, hideOthers: false, labels: nil)
			)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.POST, "/api/graphs", body: updateGraph, headers: headers)

			#expect(response.status == .created)

			let createdGraph = try response.content.decode(
				Components.Schemas.Graph.self)

			#expect(createdGraph.id != "")
			#expect(createdGraph.name == "New Graph")
			#expect(createdGraph.dateRange == .all)
			#expect(createdGraph.kind == .bar)
			#expect(createdGraph.group.group == .month)
			#expect(createdGraph.group.hideOthers == false)
		}
	}

	@Test("Create new graph with invalid owner ID")
	func testCreateNewGraphWithInvalidOwnerId() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let updateGraph = Components.Schemas.GraphInput(
				groupOwnerId: try testData.group2.requireID().uuidString,
				name: "New Graph",
				kind: .bar,
				dateRange: .all,
				group: .init(group: .month, hideOthers: false, labels: nil))

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.POST, "/api/graphs", body: updateGraph, headers: headers)

			#expect(response.status == .forbidden)

			let data = try? response.content.decode(
				Components.Schemas.InvalidGroupOwnerId.self)

			#expect(data != nil)
			#expect(data?.code == "API10004")
		}
	}

	@Test("Update graph")
	func testUpdateGraph() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let (_, graph2, _) = try await generateGraphs(
				app: app, data: testData, labels: labels)
			let labelIds = try labels.map({ try $0.requireID().uuidString })

			let updateGraph = Components.Schemas.GraphInput(
				groupOwnerId: testData.group.id!.uuidString,
				name: "Updated Graph",
				kind: .line,
				dateRange: .halfYear,
				group: .init(
					group: .labels, hideOthers: false,
					labels: [labelIds[2], labelIds[4]]),
				horizontalGroup: .init(
					group: .labels, hideOthers: true,
					labels: [labelIds[3], labelIds[5]]))

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)
			let graph2Id = try graph2.requireID()

			let response = try await apiTester.sendRequest(
				.PUT, "/api/graphs/\(graph2Id)", body: updateGraph,
				headers: headers)

			#expect(response.status == .ok)

			let updatedGraph = try response.content.decode(
				Components.Schemas.Graph.self)

			#expect(updatedGraph.id == graph2Id.uuidString)
			#expect(updatedGraph.name == "Updated Graph")
			#expect(updatedGraph.dateRange == .halfYear)
			#expect(updatedGraph.kind == .line)
			#expect(updatedGraph.group.group == .labels)
			#expect(updatedGraph.group.hideOthers == false)
			#expect(updatedGraph.group.labels == [2, 4].map({ labelIds[$0] }))
			#expect(updatedGraph.horizontalGroup?.group == .labels)
			#expect(updatedGraph.horizontalGroup?.hideOthers == true)
			#expect(
				updatedGraph.horizontalGroup?.labels
					== [3, 5].map({ labelIds[$0] }))
		}
	}

	@Test("Update graph with invalid labels")
	func testUpdateGraphWithInvalidLabels() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let labelIds = try labels.map({ try $0.requireID().uuidString })
			let (_, graph2, _) = try await generateGraphs(
				app: app, data: testData, labels: labels)

			let updatedGraph = Components.Schemas.GraphInput(
				groupOwnerId: testData.group.id!.uuidString, name: "Updated Graph",
				kind: .line,
				dateRange: .halfYear,
				group: .init(
					group: .labels, hideOthers: false,
					labels: [labelIds[2], labelIds[4], labelIds[11]]),
				horizontalGroup: .init(
					group: .labels, hideOthers: true,
					labels: [labelIds[3], labelIds[5], labelIds[12]]))

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.PUT, "/api/graphs/\(graph2.requireID())", body: updatedGraph,
				headers: headers)

			#expect(response.status == .notFound)

			let notFoundLabels = try response.content.decode(
				Components.Schemas.NotFoundLabels.self)

			#expect(notFoundLabels.validLabels.count == 4)
			#expect(notFoundLabels.invalidLabels.count == 2)
			let validLabels = [1, 2, 3, 4].map({ labelIds[$0] })
			#expect(
				notFoundLabels.validLabels.contains(where: {
					validLabels.contains($0)
				}))

			let invalidLabels = [11, 12].map({ labelIds[$0] })
			#expect(
				notFoundLabels.invalidLabels.contains(where: {
					invalidLabels.contains($0)
				}))
		}
	}

	@Test("Update non-existing graph")
	func testUpdateNonExistingGraph() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let labelIds = try labels.map({ try $0.requireID().uuidString })
			let nonExistingGraphId = UUID()

			let updateGraph = Components.Schemas.GraphInput(
				groupOwnerId: testData.group.id!.uuidString,
				name: "Non-Existing Graph",
				kind: .line,
				dateRange: .halfYear,
				group: .init(
					group: .labels, hideOthers: false,
					labels: [labelIds[0], labelIds[1]]),
				horizontalGroup: .init(
					group: .labels, hideOthers: true,
					labels: [labelIds[2], labelIds[3]]))

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.PUT, "/api/graphs/\(nonExistingGraphId)", body: updateGraph,
				headers: headers)

			#expect(response.status == .notFound)

			let data = try? response.content.decode(Components.Schemas._Error.self)

			#expect(data != nil)
			#expect(data?.code == "API10008")
		}
	}

	@Test("Move up graph with deleted graph in the middle")
	func testMoveUpGraphWithDeletedGraphInTheMiddle() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let (_, graph2, _) = try await generateGraphs(
				app: app, data: testData, labels: labels)

			let graph3 = Graph(
				groupOwnerId: testData.group.id!, name: "third graph", kind: .bar,
				dateRange: .all,
				order: 3)
			try await graph3.save(on: app.db)
			let subjectId = try graph3.requireID()
			try await GraphGroup(graphId: subjectId, group: .day).save(on: app.db)
			let body = Operations.ApiGraphs_move.Input.Body.jsonPayload(direction: .up)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.PUT, "/api/graphs/\(subjectId)/move", body: body, headers: headers)

			#expect(response.status == .ok)
			let error = try? response.content.decode(Components.Schemas._Error.self)
			#expect(error == nil)

			let data = try response.content.decode(
				Operations.ApiGraphs_move.Output.Ok.Body.jsonPayload.self)

			#expect(data.results.count == 2)
			let graphsList = data.results

			let updatedGraph2 = try graphsList.first(where: {
				try $0.id == graph2.requireID().uuidString
			})
			let updatedGraph3 = graphsList.first(where: {
				$0.id == subjectId.uuidString
			})

			#expect(updatedGraph2?.order == 2)
			#expect(updatedGraph3?.order == 1)
		}
	}

	@Test("Move down graph with deleted graph in the middle")
	func testMoveDownGraphWithDeletedGraphInTheMiddle() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let (_, graph2, _) = try await generateGraphs(
				app: app, data: testData, labels: labels)

			let graph3 = Graph(
				groupOwnerId: testData.group.id!, name: "third graph", kind: .bar,
				dateRange: .all,
				order: 3)
			try await graph3.save(on: app.db)
			let graph3Id = try graph3.requireID()
			try await GraphGroup(graphId: graph3Id, group: .day).save(on: app.db)
			let body = Operations.ApiGraphs_move.Input.Body.jsonPayload(
				direction: .down)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.PUT, "/api/graphs/\(graph2.requireID())/move", body: body,
				headers: headers)

			#expect(response.status == .ok)
			let error = try? response.content.decode(Components.Schemas._Error.self)
			#expect(error == nil)

			let data = try response.content.decode(
				Operations.ApiGraphs_move.Output.Ok.Body.jsonPayload.self)

			#expect(data.results.count == 2)
			let graphsList = data.results

			let updatedGraph2 = try graphsList.first(where: {
				try $0.id == graph2.requireID().uuidString
			})
			let updatedGraph3 = graphsList.first(where: { $0.id == graph3Id.uuidString }
			)

			#expect(updatedGraph2?.order == 2)
			#expect(updatedGraph3?.order == 1)
		}
	}

	@Test("Delete graph")
	func testDeleteGraph() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let (_, graph2, _) = try await generateGraphs(
				app: app, data: testData, labels: labels)
			let graphId = try graph2.requireID()

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.DELETE, "/api/graphs/\(graphId)", headers: headers)

			#expect(response.status == .ok)

			let data = try response.content.decode(Bool.self)

			#expect(data == true)

			let count = try await Graph.query(on: app.db).filter(\.$id == graphId)
				.count()
			#expect(count == 0)
		}
	}

	@Test("Delete invalid graph")
	func testDeleteInvalidGraph() async throws {
		try await withApp { app in
			let invalidGraphId = UUID()
			let testData = try await createGroupsAndUsers(app: app)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.DELETE, "/api/graphs/\(invalidGraphId)", headers: headers)

			#expect(response.status == .notFound)

			let data = try response.content.decode(Components.Schemas._Error.self)

			#expect(data.code == "API10010")
		}
	}

	@Test("Delete graph not owned")
	func testDeleteGraphNotOwned() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let labels = try await createTestLabels(app: app, testData: testData)
			let (_, _, graph3) = try await generateGraphs(
				app: app, data: testData, labels: labels)
			let notOwnedGraphId = try graph3.requireID()

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				)
			)

			let response = try await apiTester.sendRequest(
				.DELETE, "/api/graphs/\(notOwnedGraphId)", headers: headers)

			#expect(response.status == .notFound)

			let data = try response.content.decode(Components.Schemas._Error.self)

			#expect(data.code == "API10010")
		}
	}

}
