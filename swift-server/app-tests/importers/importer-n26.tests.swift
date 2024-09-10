import Fluent
import Vapor
import XCTVapor
import XCTest

@testable import App

final class N26ImporterTests: BaseImporterTests {
    
    override func getParsers() throws -> [any ParserFactory] {
        return [N26Importer()]
    }

	func testN26Import() async throws {
		let groupOwnerId = try self.group.requireID()
		let db = try getDb()

		let filePath = getTestFile(file: "test_files/n26_es.csv")

		try await importerService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: "n26/es",
			fileName: "n26-file.csv", filePath: filePath)

		let reports = try await statusReportsService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(reports.list.count, 1)
		XCTAssertEqual(reports.list.first?.status, "OK")

		let transactions = try await bankTransactionService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(transactions.list.count, 3)

		// Check specific transaction
		let testTransaction = transactions.list.first { $0.date == DateOnly("2019-01-20") }
		XCTAssertNotNil(testTransaction)
		XCTAssertEqual(testTransaction?.value, 120)
		XCTAssertEqual(testTransaction?.movementName, "Dr Who")
	}

	func testN26ImportInvalidFile() async throws {
		let groupOwnerId = try self.group.requireID()
		let db = try getDb()

		let filePath = "invalid"

		try await importerService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: "n26/es",
			fileName: "n26-file.csv", filePath: filePath)

		let reports = try await statusReportsService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(reports.list.count, 1)
		XCTAssertEqual(reports.list.first?.status, "ERR")
		XCTAssertEqual(reports.list.first?.fileName, "n26-file.csv")
		XCTAssertContains(
			reports.list.first?.description, "E10010: Csv cannot be parsed at")
		XCTAssertEqual(reports.list.first?.context, "{\"fileName\":\"invalid\"}")
		// XCTAssert(reports.list.first?.stack?.contains("at N26Importer.") ?? false)
	}
}
