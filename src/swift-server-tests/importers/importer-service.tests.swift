import Fluent
import Queues
import Testing
import Vapor
import VaporTesting

@testable import MrScroogeServer

@Suite("Importer Service Tests")
final class ImporterServiceTests: BaseImporterTesting {

	@Test("Import everything fine")
	func testImportEverythingFine() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [
					TestBasicImporter(),
					TestBasicImporter(
						key: "test-invalid-data", data: [["a": "b"]]),
				])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			let _ = try await services.importerService.importFromFile(
				on: app.db, withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "test-account",
				fileName: "test-file.csv", filePath: "whatever")

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 1)
			#expect(reports.list.first?.status == .ok)
			#expect(reports.list.first?.description == "")
			#expect(reports.list.first?.context == nil)

			let (transactions, _) = try await services.bankTransactionService.getAll(
				groupIds: [groupOwnerId])
			#expect(transactions.list.count == 4)
		}
	}

	@Test("Import with invalid parser key")
	func testImportInvalidParserKey() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [
					TestBasicImporter(),
					TestBasicImporter(
						key: "test-invalid-data", data: [["a": "b"]]),
				])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			let _ = try await services.importerService.importFromFile(
				on: app.db, withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "invalid-key",
				fileName: "some-file", filePath: "someother")

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 1)
			guard let importReport = reports.list.first else {
				return
			}
			#expect(importReport.status == .error)
			#expect(importReport.description.contains("E10000: Parser not found"))
			#expect(importReport.context == "{\"parserKey\":\"invalid-key\"}")
		}
	}

	@Test("Import with one duplicated")
	func testImportWithOneDuplicated() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [
					TestBasicImporter(),
					TestBasicImporter(
						key: "test-invalid-data", data: [["a": "b"]]),
				])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			// Create a repeated transaction
			let repeatedInfo = SAMPLE_DATA[1]
			let repeatedTransaction = try TestBasicImporter().transformHelper.map(
				repeatedInfo
			)
			.toBankTransaction(kind: "test-account", groupOwnerId: groupOwnerId)
			let _ = try await services.bankTransactionService.addTransaction(
				transaction: repeatedTransaction)

			let _ = try await services.importerService.importFromFile(
				on: app.db, withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "test-account",
				fileName: "something", filePath: "some-more")

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 1)
			#expect(reports.list.first?.status == .ok)

			let (transactions, _) = try await services.bankTransactionService.getAll(
				groupIds: [groupOwnerId])
			#expect(transactions.list.count == 5)

			let statusRows = try await FileImportRow.query(on: app.db).all()
			#expect(statusRows.count == 4)

			let repeatedRow = try await FileImportRow.query(on: app.db)
				.filter(\.$movementName == repeatedTransaction.movementName)
				.first()
			#expect(repeatedRow?.message == "Repeated row, but inserted")
		}
	}

	@Test("Import with multiple duplicates")
	func testImportWithMultipleDuplicatesDuplicated() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [
					TestBasicImporter(),
					TestBasicImporter(
						key: "test-invalid-data", data: [["a": "b"]]),
				])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			let repeatedTransaction = try TestBasicImporter().transformHelper.map(
				SAMPLE_DATA[1]
			)
			.toBankTransaction(kind: "test-account", groupOwnerId: groupOwnerId)
			let repeatedTransaction2 = try TestBasicImporter().transformHelper.map(
				SAMPLE_DATA[2]
			).toBankTransaction(kind: "test-account", groupOwnerId: groupOwnerId)
			let _ = try await services.bankTransactionService.addTransaction(
				transaction: repeatedTransaction)
			let _ = try await services.bankTransactionService.addTransaction(
				transaction: repeatedTransaction2)

			let _ = try await services.importerService.importFromFile(
				on: app.db, withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "test-account",
				fileName: "something", filePath: "some-more")

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 1)
			#expect(reports.list.first?.status == .warn)

			let (transactions, _) = try await services.bankTransactionService.getAll(
				groupIds: [groupOwnerId])
			#expect(transactions.list.count == 4)

			let statusRows = try await FileImportRow.query(on: app.db).all()
			#expect(statusRows.count == 4)

			let repeatedRow = try await FileImportRow.query(on: app.db)
				.filter(\.$movementName == repeatedTransaction.movementName)
				.first()
			#expect(repeatedRow?.message == "Repeated row, not inserted")
		}
	}

	@Test("Do not insert multiple duplicates")
	func testDoNotInsertMultipleDuplicates() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [
					TestBasicImporter(),
					TestBasicImporter(
						key: "test-invalid-data", data: [["a": "b"]]),
				])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			let _ = try await services.importerService.importFromFile(
				on: app.db, withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "test-account",
				fileName: "some-file", filePath: "someother")

			let _ = try await services.importerService.importFromFile(
				on: app.db, withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "test-account",
				fileName: "some-file", filePath: "someother")

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 2)
			#expect(reports.list[1].status == .ok)
			#expect(reports.list[1].description == "")
			#expect(reports.list[0].status == .warn)
			#expect(reports.list[0].description == "")

			let (transactions, _) = try await services.bankTransactionService.getAll(
				groupIds: [groupOwnerId])
			#expect(transactions.list.count == 4)

			let statusRows = try await FileImportRow.query(on: app.db).all()
			#expect(statusRows.count == 8)
		}
	}

	@Test("Invalid data import")
	func testInvalidDataImport() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [
					TestBasicImporter(),
					TestBasicImporter(
						key: "test-invalid-data", data: [["a": "b"]]),
				])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			let _ = try await services.importerService.importFromFile(
				on: app.db, withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "test-invalid-data",
				fileName: "invalid-file.csv", filePath: "invalid-data")

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 1)

			guard let report = reports.list.first else {
				return
			}

			#expect(report.status == .error)
			#expect(report.description != "")
			#expect(report.description.contains("E10004"))
			#expect(
				report.context
					== "{\"invalidFields\":[\"movementName\",\"date\",\"value\"]}"
			)

			let (transactions, _) = try await services.bankTransactionService.getAll(
				groupIds: [groupOwnerId])
			#expect(transactions.list.count == 0)

			let statusRows = try await FileImportRow.query(on: app.db).all()
			#expect(statusRows.count == 0)
		}
	}
}
