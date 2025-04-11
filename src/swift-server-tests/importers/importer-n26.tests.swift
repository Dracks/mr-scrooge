import Fluent
import Queues
import Testing
import Vapor
import VaporTesting

@testable import MrScroogeServer

@Suite("N26")
final class N26ImporterTests: BaseImporterTesting {

	@Test("Import from N26")
	func testN26Import() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [N26Importer()])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			let filePath = try #require(
				Bundle.module.url(forResource: "n26_es", withExtension: "csv")
			)

			let _ = try await services.importerService.importFromFile(
				on: app.db,
				withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "n26/es",
				fileName: "n26-file.csv",
				filePath: filePath.path)

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 1)
			#expect(reports.list.first?.status == .ok)

			let (transactions, _) = try await services.bankTransactionService.getAll(
				groupIds: [groupOwnerId])
			#expect(transactions.list.count == 3)

			let testTransaction = transactions.list.first {
				$0.date == DateOnly("2019-01-20")
			}
			#expect(testTransaction != nil)
			#expect(testTransaction?.value == 120)
			#expect(testTransaction?.movementName == "Dr Who")
		}
	}

	@Test("Import invalid file from N26")
	func testN26ImportInvalidFile() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [N26Importer()])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			let filePath = "invalid"

			let _ = try await services.importerService.importFromFile(
				on: app.db,
				withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "n26/es",
				fileName: "n26-file.csv",
				filePath: filePath)

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 1)
			guard let first = reports.list.first else {
				return
			}
			#expect(first.status == .error)
			#expect(first.fileName == "n26-file.csv")
			#expect(first.description.contains("E10010: Csv cannot be parsed at"))
			#expect(first.context == "{\"fileName\":\"invalid\"}")
		}
	}
}
