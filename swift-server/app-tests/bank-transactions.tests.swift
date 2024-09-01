import GraphQLKit
import Graphiti
import OrderedCollections
import Vapor
import XCTest

@testable import App

final class BankTransactionTests: AbstractBaseTestsClass {
	let query = """
		query($groupIds: [UUID!]!, $limit: Int, $cursor: String) {
		  bankTransaction(groupIds: $groupIds, limit: $limit, cursor: $cursor) {
		    ... on BankTransactionResponse {
		    results {
		      id
		      date
		      value
		movementName
		    }
		    next
		}
		  }
		}
		"""

	private func createTestBankTransactions() async throws -> [BankTransaction] {
		let testGroupId = try testGroup.requireID()
		let testGroupId2 = try testGroup2.requireID()
		var transactions = BankTransactionFactory().createSequence(5) { transaction in
			transaction.$groupOwner.id = testGroupId
			return transaction
		}
		[
			BankTransactionFactory().build {
				$0.$groupOwner.id = testGroupId
				$0.date = DateOnly(year: 2022, month: 2, day: 1)!
				return $0
			},
			BankTransactionFactory().build {
				$0.$groupOwner.id = testGroupId
				$0.date = DateOnly(year: 2022, month: 1, day: 30)!
				$0.movementName = "Hello world!"
				return $0
			},
			BankTransactionFactory().build {
				$0.$groupOwner.id = testGroupId
				$0.date = DateOnly(year: 2023, month: 1, day: 30)!
				return $0
			},
			BankTransactionFactory().build {
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
			forUser: SessionTypes.Credentials(
				username: "test-user", password: "test-password"))
		let res = try await app.queryGql(
			GraphQLRequest(
				query: query,
				variables: toVars(["limit": 5, "groupIds": [testGroup.requireID()]])
			), headers: identifiedHeaders)
		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(GraphQLResult.self)
		XCTAssertEqual(data.errors, [])

		let results = data.data?["bankTransaction"]["results"].array
		XCTAssertEqual(results?.count, 5)
		XCTAssertEqual(results?.first?["date"].string, "2023-01-30")
		guard let lastId = results?.last?["id"].string else {
			throw TestError()
		}
		print(lastId)
		XCTAssertEqual(data.data?["bankTransaction"]["next"].string, "2022-02-02:\(lastId)")
	}

	func getCursor(headers identifiedHeaders: HTTPHeaders) async throws -> String {
		let res = try await app?.queryGql(
			GraphQLRequest(
				query: query,
				variables: toVars(["limit": 5, "groupIds": [testGroup.requireID()]])
			), headers: identifiedHeaders)
		let data = try res?.content.decode(GraphQLResult.self)
		return (data?.data?["bankTransaction"]["next"].string)!
	}

	func testCursorWithDuplicatedDate() async throws {
		let app = try getApp()

		// Create test bank transactions
		let _ = try await createTestBankTransactions()

		let identifiedHeaders = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: "test-user", password: "test-password"))

		let cursor = try await getCursor(headers: identifiedHeaders)

		// Test cursor with duplicated date
		let res = try await app.queryGql(
			GraphQLRequest(
				query: query,
				variables: toVars([
					"limit": 5, "cursor": cursor,
					"groupIds": [testGroup.requireID()],
				])), headers: identifiedHeaders)
		XCTAssertEqual(res.status, .ok)
		let data = try res.content.decode(GraphQLResult.self)
		XCTAssertEqual(data.errors, [])

		let cursorResults = data.data?["bankTransaction"]["results"].array
		XCTAssertEqual(cursorResults?.count, 3)
		XCTAssertEqual(cursorResults?.first?["date"].string, "2022-02-02")
		XCTAssertEqual(data.data?["bankTransaction"]["next"].string, nil)
	}

}
