import XCTest

@testable import App

final class CommerzBankEnImporterTests: BaseImporterTests {
	override func getParsers() throws -> [any ParserFactory] {
		return [CommerzBankEnImporter()]
	}
	func testInsertingDataInCommerzBank() async throws {
		let groupOwnerId = try self.group.requireID()
		let db = try getDb()

		let filePath = getTestFile(file: "test_files/commerz_bank.CSV")

		try await importerService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: "commerz-bank/en",
			fileName: "CommerzBank", filePath: filePath)

		let reports = try await statusReportsService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(reports.list.count, 1)
		XCTAssertEqual(reports.list.first?.status, .ok)
		XCTAssertEqual(reports.list.first?.description, "")
		XCTAssertNil(reports.list.first?.context)

		let transactions = try await bankTransactionService.getAll(
			on: db, groupIds: [groupOwnerId])
		XCTAssertEqual(transactions.list.count, 5)

		let queryTest = transactions.list.first(where: { $0.date == DateOnly("2019-05-02") }
		)
		XCTAssertEqual(queryTest?.value, 256.01)
		XCTAssertEqual(queryTest?.movementName, "Concept and more concepts")

		let queryTest2 = transactions.list.first(where: {
			$0.date == DateOnly("2020-01-09")
		})
		XCTAssertEqual(queryTest2?.value, -25)
		XCTAssertEqual(queryTest2?.movementName, "Commerzbank 0321554")

		let queryTest3 = transactions.list.first(where: {
			$0.date == DateOnly("2020-01-07")
		})
		XCTAssertEqual(queryTest3?.movementName, "Backerei Sipl GmbH Fil.35 GIR 69036")

		let queryTest4 = transactions.list.first(where: {
			$0.date == DateOnly("2020-02-09")
		})
		XCTAssertEqual(queryTest4?.movementName, "ARAL Some address")

		let queryTest5 = transactions.list.first(where: {
			$0.date == DateOnly("2020-02-07")
		})
		XCTAssertEqual(queryTest5?.movementName, "BACKSTUBE WUENSCHE GMBH")
	}
}

final class CommerzBankUnitTests: XCTestCase {
	func testSplitMessage() throws {
		let importerService = CommerzBankEnImporter()

		let (msg, details, date) = try importerService.splitMessage(
			"Kartenzahlung ARAL Some address 2020-02-09T21:13:19 KFN 1 VJ 2442 Kartenzahlung"
		)
		XCTAssertEqual(msg, "ARAL Some address")

	}
}
