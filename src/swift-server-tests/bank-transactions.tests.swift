import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("Bank Transaction Tests")
final class BankTransactionTests: BaseWithFactories {

	private func createTestBankTransactions(app: Application, testData: GroupsAndUsers)
		async throws
		-> [BankTransaction]
	{
		let testGroupId = try testData.group.requireID()
		let testGroupId2 = try testData.group2.requireID()

		var transactions = transactionFactory.createSequence(5) { transaction in
			transaction.$groupOwner.id = testGroupId
			return transaction
		}
		[
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.date = DateOnly(year: 2022, month: 2, day: 1)!
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.date = DateOnly(year: 2022, month: 1, day: 30)!
				$0.movementName = "Hello world!"
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.date = DateOnly(year: 2023, month: 1, day: 30)!
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId
				$0.date = DateOnly(year: 2042, month: 1, day: 30)!
				return $0
			},
			transactionFactory.build {
				$0.$groupOwner.id = testGroupId2
				return $0
			},
		].forEach({ transactions.append($0) })

		for transaction in transactions {
			try await transaction.save(on: app.db)
		}

		return transactions
	}

	@Test("Basic pagination")
	func testBasicPagination() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let _ = try await createTestBankTransactions(app: app, testData: testData)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let response = try await apiTester.sendRequest(
				.GET, "/api/bank-transactions?limit=5", headers: headers)
			#expect(response.status == .ok)

			let data = try response.content.decode(
				Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

			let results = data.results
			#expect(results.count == 5)
			#expect(results.first?.date == "2042-01-30")
			guard let lastId = results.last?.id else {
				throw TestError()
			}
			#expect(data.next == "2022-02-02:\(lastId)")
		}
	}

	func getCursor(
		_ testApi: TestingApplicationTester, headers identifiedHeaders: HTTPHeaders,
		groupId: UUID
	) async throws -> String {
		let res = try await testApi.sendRequest(
			.GET,
			"/api/bank-transactions?limit=5&groupIds[]=\(groupId.uuidString)",
			headers: identifiedHeaders)
		let data = try res.content.decode(
			Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)
		return try #require(data.next)
	}

	@Test("Cursor with duplicated date")
	func testCursorWithDuplicatedDate() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let _ = try await createTestBankTransactions(app: app, testData: testData)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let cursor = try await getCursor(
				apiTester, headers: headers, groupId: testData.group.requireID())

			let response = try await apiTester.sendRequest(
				.GET,
				"/api/bank-transactions?limit=5&groupIds[]=\(testData.group.requireID().uuidString)&cursor=\(cursor)",
				headers: headers)

			#expect(response.status == .ok)

			let data = try response.content.decode(
				Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

			let cursorResults = data.results
			#expect(cursorResults.count == 4)
			#expect(cursorResults.first?.date == "2022-02-02")
			#expect(data.next == nil)
		}
	}

	@Test("Show labels")
	func testShowLabels() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let testGroupId = try testData.group.requireID()
			let transaction: BankTransaction = transactionFactory.build { transaction in
				transaction.$groupOwner.id = testGroupId
				return transaction
			}
			try await transaction.save(on: app.db)
			let labels = try await createTestLabels(app: app, testData: testData)

			try await transaction.$labels.attach(labels[0], on: app.db) { pivot in
				pivot.linkReason = .manualEnabled
			}
			try await transaction.$labels.attach(labels[1], on: app.db) { pivot in
				pivot.linkReason = .manualDisabled
			}
			try await transaction.$labels.attach(labels[2], on: app.db) { pivot in
				pivot.linkReason = .automatic
			}

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let response = try await apiTester.sendRequest(
				.GET,
				"/api/bank-transactions?limit=5&groupIds[]=\(testData.group.requireID().uuidString)",
				headers: headers)

			#expect(response.status == .ok)

			let data = try response.content.decode(
				Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

			#expect(
				try data.results.first?.labelIds.contains(
					labels[0].requireID().uuidString) ?? false)
			#expect(
				try data.results.first?.labelIds.contains(
					labels[2].requireID().uuidString) ?? false)
			#expect(
				try
					!(data.results.first?.labelIds.contains(
						labels[1].requireID().uuidString) ?? true))
		}
	}

	@Test("Link label")
	func testLinkLabel() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let testGroupId = try testData.group.requireID()
			let transactions = transactionFactory.createSequence(2) { transaction in
				transaction.$groupOwner.id = testGroupId
				return transaction
			}
			for transaction in transactions {
				try await transaction.save(on: app.db)
			}
			let transactionIds = try transactions.map { try $0.requireID() }
			let labels = try await createTestLabels(app: app, testData: testData)

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let createResponse = try await apiTester.sendRequest(
				.POST,
				"/api/bank-transactions/\(transactionIds.first!.uuidString)/label/\(labels[3].requireID().uuidString)",
				headers: headers)
			#expect(createResponse.status == .ok)

			let response = try await apiTester.sendRequest(
				.GET,
				"/api/bank-transactions?limit=5&groupIds[]=\(testGroupId.uuidString)",
				headers: headers)

			#expect(response.status == .ok)
			let data = try response.content.decode(
				Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

			let resultsDic: [UUID: Components.Schemas.BankTransaction] = Dictionary(
				grouping: data.results
			) {
				UUID(uuidString: $0.id)!
			}.mapValues { $0.first! }

			#expect(resultsDic[transactionIds.first!] != nil)
			#expect(resultsDic[transactionIds.first!]?.labelIds.count == 1)
			#expect(resultsDic[transactionIds.last!]?.labelIds.isEmpty ?? false)
			#expect(
				try resultsDic[transactionIds.first!]?.labelIds.contains(
					labels[3].requireID().uuidString) ?? false)
		}
	}

	@Test("Unlink label")
	func testUnlinkLabel() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let testGroupId = try testData.group.requireID()
			let transactions = transactionFactory.createSequence(2) { transaction in
				transaction.$groupOwner.id = testGroupId
				return transaction
			}
			let labels = try await createTestLabels(app: app, testData: testData)
			for transaction in transactions {
				try await transaction.save(on: app.db)
				try await transaction.$labels.attach(labels[3], on: app.db) {
					pivot in
					pivot.linkReason = .automatic
				}
			}
			let transactionIds = try transactions.map { try $0.requireID() }

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let createResponse = try await apiTester.sendRequest(
				.DELETE,
				"/api/bank-transactions/\(transactionIds.first!.uuidString)/label/\(labels[3].requireID().uuidString)",
				headers: headers)
			#expect(createResponse.status == .ok)

			let response = try await apiTester.sendRequest(
				.GET,
				"/api/bank-transactions?limit=5&groupIds[]=\(testGroupId.uuidString)",
				headers: headers)

			#expect(response.status == .ok)
			let data = try response.content.decode(
				Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

			let resultsDic: [UUID: Components.Schemas.BankTransaction] = Dictionary(
				grouping: data.results
			) {
				UUID(uuidString: $0.id)!
			}.mapValues { $0.first! }

			#expect(resultsDic[transactionIds.first!] != nil)
			#expect(resultsDic[transactionIds.first!]?.labelIds.isEmpty ?? false)
			#expect(resultsDic[transactionIds.last!]?.labelIds.count == 1)
		}
	}

	@Test("Set comment")
	func testSetComment() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let testGroupId = try testData.group.requireID()
			let transactions = transactionFactory.createSequence(2) { transaction in
				transaction.$groupOwner.id = testGroupId
				return transaction
			}
			for transaction in transactions {
				try await transaction.save(on: app.db)
			}
			let transactionIds = try transactions.map { try $0.requireID() }

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let comment = Operations.ApiBankTransactions_comment.Input.Body.jsonPayload(
				comment: "EXTERMINATE!")

			let createResponse = try await apiTester.sendRequest(
				.PATCH,
				"/api/bank-transactions/\(transactionIds.first!.uuidString)/",
				body: comment, headers: headers)
			#expect(createResponse.status == .ok)

			let response = try await apiTester.sendRequest(
				.GET,
				"/api/bank-transactions?limit=5&groupIds[]=\(testData.group.requireID().uuidString)",
				headers: headers)

			#expect(response.status == .ok)
			let data = try response.content.decode(
				Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

			let resultsDic: [UUID: Components.Schemas.BankTransaction] = Dictionary(
				grouping: data.results
			) {
				UUID(uuidString: $0.id)!
			}.mapValues { $0.first! }

			#expect(resultsDic[transactionIds.first!] != nil)
			#expect(resultsDic[transactionIds.last!]?.comment == nil)
			#expect(resultsDic[transactionIds.first!]?.comment == "EXTERMINATE!")
		}
	}

	@Test("Unset comment")
	func testUnSetComment() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let testGroupId = try testData.group.requireID()
			let transactions = transactionFactory.createSequence(2) { transaction in
				transaction.$groupOwner.id = testGroupId
				transaction.comment = "Daleks!"
				return transaction
			}
			for transaction in transactions {
				try await transaction.save(on: app.db)
			}
			let transactionIds = try transactions.map { try $0.requireID() }

			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let comment = Operations.ApiBankTransactions_comment.Input.Body.jsonPayload(
				comment: nil)

			let createResponse = try await apiTester.sendRequest(
				.PATCH,
				"/api/bank-transactions/\(transactionIds.first!.uuidString)/",
				body: comment, headers: headers)
			#expect(createResponse.status == .ok)

			let response = try await apiTester.sendRequest(
				.GET,
				"/api/bank-transactions?limit=5&groupIds[]=\(testData.group.requireID().uuidString)",
				headers: headers)

			#expect(response.status == .ok)
			let data = try response.content.decode(
				Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

			let resultsDic: [UUID: Components.Schemas.BankTransaction] = Dictionary(
				grouping: data.results
			) {
				UUID(uuidString: $0.id)!
			}.mapValues { $0.first! }

			#expect(resultsDic[transactionIds.first!] != nil)
			#expect(resultsDic[transactionIds.last!]?.comment == "Daleks!")
			#expect(resultsDic[transactionIds.first!]?.comment == nil)
		}
	}

}
