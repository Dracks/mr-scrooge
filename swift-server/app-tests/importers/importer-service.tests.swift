import Fluent
import Vapor
import XCTVapor
import XCTest

@testable import App

final class ImporterServiceTests: BaseImporterTests {
	override func getParsers() throws -> [any ParserFactory] {
		return [
			TestBasicImporter(),
			TestBasicImporter(key: "test-invalid-data", data: [["a": "b"]]),
		]
	}

	func testImportEverythingFine() async throws {
		let groupOwnerId = try self.group.requireID()
		let db = try getDb()
		try await importerService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: "test-account",
			fileName: "test-file.csv", filePath: "whatever")

		let reports = try await statusReportsService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(reports.list.count, 1)
		XCTAssertEqual(reports.list.first?.status, .ok)
		XCTAssertEqual(reports.list.first?.description, "")
		XCTAssertEqual(reports.list.first?.context, nil)

		let transactions = try await bankTransactionService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(transactions.list.count, 4)
	}

	func testImportInvalidParserKey() async throws {
		let groupOwnerId = try self.group.requireID()
		let db = try getDb()

		try await importerService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: "invalid-key",
			fileName: "some-file", filePath: "someother")

		let reports = try await statusReportsService.getAll(
			on: db, groupIds: [groupOwnerId])
		print(reports)
		XCTAssertEqual(reports.list.count, 1)
		let importReport = reports.list.first
		XCTAssertEqual(importReport?.status, .error)
		XCTAssertContains(importReport?.description, "E10000: Parser not found")
		XCTAssertEqual(importReport?.context, "{\"parserKey\":\"invalid-key\"}")
	}

	func testImportWithOneDuplicated() async throws {
		let groupOwnerId = try self.group.requireID()
		let db = try getDb()

		// Create a repeated transaction
		let repeatedInfo = SAMPLE_DATA[1]
		let repeatedTransaction = try TestBasicImporter().transformHelper.map(repeatedInfo)
			.toBankTransaction(kind: "test-account", groupOwnerId: groupOwnerId)
		let _ = try await bankTransactionService.addTransaction(
			on: db, transaction: repeatedTransaction)

		// Import the file
		try await importerService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: "test-account",
			fileName: "something", filePath: "some-more")

		// Check import status
		let reports = try await statusReportsService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(reports.list.count, 1)
		XCTAssertEqual(reports.list.first?.status, .ok)

		// Check transactions
		let transactions = try await bankTransactionService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(transactions.list.count, 5)

		// Check status report rows
		let statusRows = try await StatusReportRow.query(on: db).all()
		XCTAssertEqual(statusRows.count, 4)

		let repeatedRow = try await StatusReportRow.query(on: db)
			.filter(\.$movementName == repeatedTransaction.movementName)
			.first()
		XCTAssertEqual(repeatedRow?.message, "Repeated row, but inserted")
	}

	func testDoNotInsertMultipleDuplicates() async throws {
		let groupOwnerId = try self.group.requireID()
		let db = try getDb()

		// Import the file twice
		try await importerService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: "test-account",
			fileName: "some-file", filePath: "someother")

		try await importerService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: "test-account",
			fileName: "some-file", filePath: "someother")

		// Check import status
		let reports = try await statusReportsService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(reports.list.count, 2)
		XCTAssertEqual(reports.list[1].status, .ok)
		XCTAssertEqual(reports.list[1].description, "")
		XCTAssertEqual(reports.list[0].status, .warn)
		XCTAssertEqual(reports.list[0].description, "")

		// Check transactions
		let transactions = try await bankTransactionService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(transactions.list.count, 4)

		// Check status report rows
		let statusRows = try await StatusReportRow.query(on: db).all()
		XCTAssertEqual(statusRows.count, 8)
	}

	func testInvalidDataImport() async throws {
		let groupOwnerId = try self.group.requireID()
		let db = try getDb()

		// Attempt to import invalid data
		try await importerService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: "test-invalid-data",
			fileName: "invalid-file.csv", filePath: "invalid-data")

		// Check import status
		let reports = try await statusReportsService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(reports.list.count, 1)

		let report = reports.list.first

		XCTAssertEqual(report?.status, .error)
		XCTAssertNotNil(report?.description)
		XCTAssertTrue(report?.description.contains("E10004") ?? false)
		XCTAssertEqual(
			report?.context, "{\"invalidFields\":[\"movementName\",\"date\",\"value\"]}"
		)

		// Check that no transactions were imported
		let transactions = try await bankTransactionService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(transactions.list.count, 0)

		// Check status report rows
		let statusRows = try await StatusReportRow.query(on: db).all()
		XCTAssertEqual(statusRows.count, 0)
	}

}
