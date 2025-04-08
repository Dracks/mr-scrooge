import XCTVapor
import XCTest

@testable import MrScroogeServer

final class BankTransactionTests: AbstractBaseTestsClass {

	private func createTestBankTransactions() async throws -> [BankTransaction] {
		let testGroupId = try testGroup.requireID()
		let testGroupId2 = try testGroup2.requireID()

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
			try await transaction.save(on: self.app!.db)
		}

		return transactions
	}

	func testBasicPagination() async throws {
		let app = try getApp()

		// Create test bank transactions
		let _ = try await createTestBankTransactions()

		// Test basic pagination
		let identifiedHeaders = try await app.getHeaders(
			forUser: Components.Schemas.UserCredentials(
				username: "test-user", password: "test-password"))
		let res = try await app.sendRequest(
			.GET, "/api/bank-transactions?limit=5", headers: identifiedHeaders)
		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(
			Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

		let results = data.results
		XCTAssertEqual(results.count, 5)
		XCTAssertEqual(results.first?.date, "2042-01-30")
		guard let lastId = results.last?.id else {
			throw TestError()
		}
		XCTAssertEqual(data.next, "2022-02-02:\(lastId)")
	}

	func getCursor(headers identifiedHeaders: HTTPHeaders) async throws -> String {
		let res = try await app?.sendRequest(
			.GET,
			"/api/bank-transactions?limit=5&groupIds[]=\(testGroup.requireID().uuidString)",
			headers: identifiedHeaders)
		let data = try res?.content.decode(
			Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)
		return try XCTUnwrap(data?.next)
	}

	func testCursorWithDuplicatedDate() async throws {
		let app = try getApp()

		// Create test bank transactions
		let _ = try await createTestBankTransactions()

		let identifiedHeaders = try await app.getHeaders(
			forUser: Components.Schemas.UserCredentials(
				username: "test-user", password: "test-password"))

		let cursor = try await getCursor(headers: identifiedHeaders)

		// Test cursor with duplicated date
		let res = try await app.sendRequest(
			.GET,
			"/api/bank-transactions?limit=5&groupIds[]=\(testGroup.requireID().uuidString)&cursor=\(cursor)",
			headers: identifiedHeaders)
		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(
			Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

		let cursorResults = data.results
		XCTAssertEqual(cursorResults.count, 4)
		XCTAssertEqual(cursorResults.first?.date, "2022-02-02")
		XCTAssertEqual(data.next, nil)
	}

	func testShowLabels() async throws {
		let app = try getApp()

		let transaction: BankTransaction = transactionFactory.build { transaction in
			transaction.$groupOwner.id = self.testGroup.id!
			return transaction
		}
		try await transaction.save(on: app.db)

		try await transaction.$labels.attach(labels[0], on: app.db) { pivot in
			pivot.linkReason = .manualEnabled
		}
		try await transaction.$labels.attach(labels[1], on: app.db) { pivot in
			pivot.linkReason = .manualDisabled
		}
		try await transaction.$labels.attach(labels[2], on: app.db) { pivot in
			pivot.linkReason = .automatic
		}

		let identifiedHeaders = try await app.getHeaders(
			forUser: Components.Schemas.UserCredentials(
				username: "test-user", password: "test-password"))
		let res = try await app.sendRequest(
			.GET,
			"/api/bank-transactions?limit=5&groupIds[]=\(testGroup.requireID().uuidString)",
			headers: identifiedHeaders)

		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(
			Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

		try XCTAssertTrue(
			data.results.first?.labelIds.contains(labels[0].requireID().uuidString)
				?? false)
		try XCTAssertTrue(
			data.results.first?.labelIds.contains(labels[2].requireID().uuidString)
				?? false)
		try XCTAssertFalse(
			data.results.first?.labelIds.contains(labels[1].requireID().uuidString)
				?? true)
	}

	func testLinkLabel() async throws {
		let app = try getApp()

		let transactions = transactionFactory.createSequence(2) { transaction in
			transaction.$groupOwner.id = self.testGroup.id!
			return transaction
		}
		for transaction in transactions {
			try await transaction.save(on: app.db)
		}
		let transactionIds = try transactions.map { try $0.requireID() }

		let identifiedHeaders = try await app.getHeaders(
			forUser: Components.Schemas.UserCredentials(
				username: "test-user", password: "test-password"))

		let createRes = try await app.sendRequest(
			.POST,
			"/api/bank-transactions/\(transactionIds.first!.uuidString)/label/\(labels[3].requireID().uuidString)",
			headers: identifiedHeaders)
		XCTAssertEqual(createRes.status, .ok)

		let res = try await app.sendRequest(
			.GET,
			"/api/bank-transactions?limit=5&groupIds[]=\(testGroup.requireID().uuidString)",
			headers: identifiedHeaders)

		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(
			Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

		let resultsDic: [UUID: Components.Schemas.BankTransaction] = Dictionary(
			grouping: data.results
		) {
			UUID(uuidString: $0.id)!
		}.mapValues { $0.first! }

		XCTAssertNotNil(resultsDic[transactionIds.first!])  //data.results.last?.id, transactionIds.first?.uuidString)
		XCTAssertEqual(resultsDic[transactionIds.first!]?.labelIds.count, 1)
		XCTAssertEqual(resultsDic[transactionIds.last!]?.labelIds.count, 0)
		try XCTAssertTrue(
			resultsDic[transactionIds.first!]?.labelIds.contains(
				labels[3].requireID().uuidString)
				?? false)
	}

	func testUnlinkLabel() async throws {
		let app = try getApp()

		let transactions = transactionFactory.createSequence(2) { transaction in
			transaction.$groupOwner.id = self.testGroup.id!
			return transaction
		}
		for transaction in transactions {
			try await transaction.save(on: app.db)
			try await transaction.$labels.attach(labels[3], on: app.db) { pivot in
				pivot.linkReason = .automatic
			}
		}
		let transactionIds = try transactions.map { try $0.requireID() }

		let identifiedHeaders = try await app.getHeaders(
			forUser: Components.Schemas.UserCredentials(
				username: "test-user", password: "test-password"))

		let createRes = try await app.sendRequest(
			.DELETE,
			"/api/bank-transactions/\(transactionIds.first!.uuidString)/label/\(labels[3].requireID().uuidString)",
			headers: identifiedHeaders)
		XCTAssertEqual(createRes.status, .ok)

		let res = try await app.sendRequest(
			.GET,
			"/api/bank-transactions?limit=5&groupIds[]=\(testGroup.requireID().uuidString)",
			headers: identifiedHeaders)

		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(
			Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

		let resultsDic: [UUID: Components.Schemas.BankTransaction] = Dictionary(
			grouping: data.results
		) {
			UUID(uuidString: $0.id)!
		}.mapValues { $0.first! }

		XCTAssertNotNil(resultsDic[transactionIds.first!])  //data.results.last?.id, transactionIds.first?.uuidString)
		XCTAssertEqual(resultsDic[transactionIds.first!]?.labelIds.count, 0)
		XCTAssertEqual(resultsDic[transactionIds.last!]?.labelIds.count, 1)

	}

	func testSetComment() async throws {
		let app = try getApp()

		let transactions = transactionFactory.createSequence(2) { transaction in
			transaction.$groupOwner.id = self.testGroup.id!
			return transaction
		}
		for transaction in transactions {
			try await transaction.save(on: app.db)
		}
		let transactionIds = try transactions.map { try $0.requireID() }

		let identifiedHeaders = try await app.getHeaders(
			forUser: Components.Schemas.UserCredentials(
				username: "test-user", password: "test-password"))

		let comment = Operations.ApiBankTransactions_comment.Input.Body.jsonPayload(
			comment: "EXTERMINATE!")

		let createRes = try await app.sendRequest(
			.PATCH,
			"/api/bank-transactions/\(transactionIds.first!.uuidString)/",
			body: comment, headers: identifiedHeaders)
		XCTAssertEqual(createRes.status, .ok)

		let res = try await app.sendRequest(
			.GET,
			"/api/bank-transactions?limit=5&groupIds[]=\(testGroup.requireID().uuidString)",
			headers: identifiedHeaders)

		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(
			Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

		let resultsDic: [UUID: Components.Schemas.BankTransaction] = Dictionary(
			grouping: data.results
		) {
			UUID(uuidString: $0.id)!
		}.mapValues { $0.first! }

		XCTAssertNotNil(resultsDic[transactionIds.first!])  //data.results.last?.id, transactionIds.first?.uuidString)
		XCTAssertEqual(resultsDic[transactionIds.last!]?.comment, nil)
		XCTAssertEqual(resultsDic[transactionIds.first!]?.comment, "EXTERMINATE!")
	}

	func testUnSetComment() async throws {
		let app = try getApp()

		let transactions = transactionFactory.createSequence(2) { transaction in
			transaction.$groupOwner.id = self.testGroup.id!
			transaction.comment = "Daleks!"
			return transaction
		}
		for transaction in transactions {
			try await transaction.save(on: app.db)
		}
		let transactionIds = try transactions.map { try $0.requireID() }

		let identifiedHeaders = try await app.getHeaders(
			forUser: Components.Schemas.UserCredentials(
				username: "test-user", password: "test-password"))

		let comment = Operations.ApiBankTransactions_comment.Input.Body.jsonPayload(
			comment: nil)

		let createRes = try await app.sendRequest(
			.PATCH,
			"/api/bank-transactions/\(transactionIds.first!.uuidString)/",
			body: comment, headers: identifiedHeaders)
		XCTAssertEqual(createRes.status, .ok)

		let res = try await app.sendRequest(
			.GET,
			"/api/bank-transactions?limit=5&groupIds[]=\(testGroup.requireID().uuidString)",
			headers: identifiedHeaders)

		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(
			Operations.ApiBankTransactions_list.Output.Ok.Body.jsonPayload.self)

		let resultsDic: [UUID: Components.Schemas.BankTransaction] = Dictionary(
			grouping: data.results
		) {
			UUID(uuidString: $0.id)!
		}.mapValues { $0.first! }

		XCTAssertNotNil(resultsDic[transactionIds.first!])  //data.results.last?.id, transactionIds.first?.uuidString)
		XCTAssertEqual(resultsDic[transactionIds.last!]?.comment, "Daleks!")
		XCTAssertEqual(resultsDic[transactionIds.first!]?.comment, nil)
	}

}
