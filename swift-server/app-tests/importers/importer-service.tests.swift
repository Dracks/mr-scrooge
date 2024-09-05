import Fluent
import Vapor
import XCTVapor
import XCTest

@testable import App

final class ImporterServiceTests: XCTestCase {
	var importerService: NewImportService!
	var bankTransactionService: BankTransactionService!
	var statusReportsService: StatusReportsService!
	var group: UserGroup!
	var app: Application?

	override func setUp() async throws {
		// let testParsers: [ParserFactory] = [TestBasicImporter(), N26Importer(), CommerzBankEnImporter()]

		let app = try await Application.make(.testing)
		try await configure(app)
		self.app = app

		self.group = UserGroup(name: "Test User Group")
		try await self.group.save(on: app.db)

		let testParsers: [ParserFactory] = [TestBasicImporter()]
		importerService = NewImportService(parsers: testParsers)
		bankTransactionService = BankTransactionService()
		statusReportsService = StatusReportsService()
	}

	override func tearDown() async throws {
		try await self.app?.asyncShutdown()
		self.app = nil
	}

	func getDb() throws -> Database {
		guard let app = app else {
			throw TestError()
		}
		return app.db
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
		XCTAssertEqual(reports.list.first?.status, "OK")
		XCTAssertEqual(reports.list.first?.description, "")

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
		XCTAssertEqual(importReport?.status, "ERR")
		XCTAssertContains(importReport?.description, "E10000: Parser not found")
		XCTAssertEqual(importReport?.context, "{\"parserKey\":\"invalid-key\"}")
	}

	func testImportWithOneDuplicated() async throws {
		let groupOwnerId = try self.group.requireID()
		let db = try getDb()
		
		// Create a repeated transaction
        let repeatedInfo = SAMPLE_DATA[1]
        let repeatedTransaction = try TestBasicImporter().transformHelper.map(repeatedInfo).toBankTransaction(kind: "test-account", groupOwnerId: groupOwnerId)
		let _ = try await bankTransactionService.addTransaction(on: db, transaction: repeatedTransaction)
		
		// Import the file
		try await importerService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: "test-account",
			fileName: "something", filePath: "some-more")
		
		// Check import status
		let reports = try await statusReportsService.getAll(on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(reports.list.count, 1)
		XCTAssertEqual(reports.list.first?.status, "OK")
		
		// Check transactions
		let transactions = try await bankTransactionService.getAll(on: db, groupIds: [groupOwnerId])
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
		let reports = try await statusReportsService.getAll(on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(reports.list.count, 2)
		XCTAssertEqual(reports.list[0].status, "OK")
		XCTAssertEqual(reports.list[0].description, "")
		XCTAssertEqual(reports.list[1].status, "WARN")
		XCTAssertEqual(reports.list[1].description, "")
		
		// Check transactions
		let transactions = try await bankTransactionService.getAll(on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(transactions.list.count, 4)
		
		// Check status report rows
		let statusRows = try await StatusReportRow.query(on: db).all()
		XCTAssertEqual(statusRows.count, 8)
	}
}
