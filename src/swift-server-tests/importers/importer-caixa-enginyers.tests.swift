import Fluent
import Queues
import Testing
import Vapor
import VaporTesting

@testable import MrScroogeServer

@Suite("Caixa Enginyers")
final class CaixaEnginyersImporterTests: BaseImporterTesting {

	@Test("Import from Caixa Enginyers Account")
	func testCaixaEnginyersAccountImport() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [
					CaixaEnginyersAccountImporter(),
					CaixaEnginiersCreditImporter(),
				])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			let filePath = try #require(
				Bundle.module.url(
					forResource: "MovimientosCuenta", withExtension: "xls"))

			let _ = try await services.importerService.importFromFile(
				on: app.db, withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "caixa-enginyers/account",
				fileName: "MovimientosCuenta.xls",
				filePath: filePath.path)

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 1)
			#expect(reports.list.first?.status == .ok)
			#expect(reports.list.first?.description == "")
			#expect(reports.list.first?.context == nil)

			let (transactions, _) = try await services.bankTransactionService.getAll(
				groupIds: [groupOwnerId])
			#expect(transactions.list.count == 4)

			let august4Transaction = transactions.list.first {
				$0.date == DateOnly("2019-08-04")
			}
			#expect(august4Transaction != nil)
			#expect(august4Transaction?.value == 1500)
			#expect(august4Transaction?.movementName == "Dr Who")
			#expect(august4Transaction?.details == "Transfer")

			let november9Transaction = transactions.list.first {
				$0.date == DateOnly("2019-11-09")
			}
			#expect(november9Transaction != nil)
			#expect(november9Transaction?.value == -2.88)
			#expect(november9Transaction?.movementName == "OPERACIÓ VIKINI")
			#expect(november9Transaction?.details == "TARGETA *5019")

			let october8Transaction = transactions.list.first {
				$0.date == DateOnly("2019-10-08")
			}
			#expect(october8Transaction != nil)
			#expect(october8Transaction?.value == -120)
			#expect(october8Transaction?.movementName == "AI DIOS NOS AYUDE")
			#expect(october8Transaction?.details == "Bill")
		}
	}

	@Test("Import from Caixa Enginyers Credit Card")
	func testCaixaEnginyersCreditImport() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [
					CaixaEnginyersAccountImporter(),
					CaixaEnginiersCreditImporter(),
				])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			let filePath = try #require(
				Bundle.module.url(
					forResource: "MovimientosTarjetaCredito",
					withExtension: "xls"))

			let _ = try await services.importerService.importFromFile(
				on: app.db, withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "caixa-enginyers/credit",
				fileName: "MovimientosTarjetaCredito.xls",
				filePath: filePath.path)

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 1)
			#expect(reports.list.first?.status == .ok)
			#expect(reports.list.first?.description == "")
			#expect(reports.list.first?.context == nil)

			let (transactions, _) = try await services.bankTransactionService.getAll(
				groupIds: [groupOwnerId])
			#expect(transactions.list.count == 1)

			let transaction = transactions.list.first
			#expect(transaction != nil)
			#expect(transaction?.date == DateOnly("2018-05-12"))
			#expect(transaction?.value == -5.31)
			#expect(transaction?.movementName == "PAYPAL *SOMEHOBBY")
		}
	}

}

@Suite("Caixa Enginyers Unit")
final class CaixaEnginyersUnitTests {
	@Test("Transform the message correctly")
	func testCaixaEnginyersAccountSplitMessage() {
		let caixaEnginyersImporter = CaixaEnginyersAccountImporter()

		let (details1, movementName1) = caixaEnginyersImporter.splitMessage("R/ Some bill")
		#expect(details1 == "Bill")
		#expect(movementName1 == "Some bill")

		let (details2, movementName2) = caixaEnginyersImporter.splitMessage(
			"TRANSF: Some transfer")
		#expect(details2 == "Transfer")
		#expect(movementName2 == "Some transfer")

		let (details3, movementName3) = caixaEnginyersImporter.splitMessage(
			"TARGETA *1234 Some card transaction")
		#expect(details3 == "TARGETA *1234")
		#expect(movementName3 == "Some card transaction")

		let (details4, movementName4) = caixaEnginyersImporter.splitMessage(
			"Regular transaction")
		#expect(details4 == "")
		#expect(movementName4 == "Regular transaction")
	}
}
