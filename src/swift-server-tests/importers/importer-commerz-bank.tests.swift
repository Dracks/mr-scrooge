import Foundation
import XCTest

@testable import MrScroogeServer

final class CommerzBankEnImporterTests: BaseImporterTests {
	override func getParsers() throws -> [any ParserFactory] {
		return [CommerzBankEnImporter()]
	}

	func testRegexFile() async throws {
		let factory = importerService.getParsers().first

		XCTAssertNotNil(factory)
        guard let factory else {
            return
        }

		let regex = try Regex(factory.fileRegex)

		let fileTest = "DE19821450020041545900_EUR_11-08-2024_2056.csv"
		let match = try? regex.firstMatch(in: fileTest)
		XCTAssertNotNil(match)
	}

	func testInsertingDataInCommerzBank() async throws {
		let groupOwnerId = try self.group.requireID()
		let db = try getDb()

		let filePath: URL = try XCTUnwrap(
			Bundle.module.url(forResource: "commerz_bank", withExtension: "CSV"))

		let _ = try await importerService.importFromFile(
			on: db, withQueue: getQueue(), groupOwnerId: groupOwnerId,
			key: "commerz-bank-2024/en",
			fileName: "CommerzBank", filePath: filePath.path)

		let reports = try await statusReportsService.getAll(
			groupIds: [groupOwnerId])
		XCTAssertEqual(reports.list.count, 1)
		XCTAssertEqual(reports.list.first?.status, .ok)
		XCTAssertEqual(reports.list.first?.description, "")
		XCTAssertNil(reports.list.first?.context)

		let (transactions, _) = try await bankTransactionService.getAll(
			groupIds: [groupOwnerId])
		XCTAssertEqual(transactions.list.count, 12)

		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2024-04-23")!,
			value: -15.00,
			movementName: "AUSGABE EINER DEBITKARTE ENTGELT ERSATZKARTE GIROCARD"
		)

		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2024-03-12")!,
			value: -20.55,
			movementName:
				"Stadtwerke Ingolstadt Energie GmbH E-Mobility Rechnung Nr. 56315 zu Ve rtrag 704860, Kundennummer 718838"
		)

		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2024-03-10")!,
			value: -24.93,
			movementName: "Stadtapotheke Stephan Kurzeder e.K."
		)
		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2024-03-04")!,
			value: -20.12,
			movementName: "85053 EDEKA FANDERL"
		)
		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2024-03-01")!,
			value: -45.99,
			movementName: "M001-MEDIA MARKT"
		)
		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2024-02-29")!,
			value: -22.35,
			movementName:
				"BAUHAUS SOMEPLACE - DANKE 270217190097028271201056880 ELV6512 0607 27.02 17.19 ME0"
		)
		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2024-02-18")!,
			value: -8.00,
			movementName: "FLUGHAFEN MUENCHEN GMBH GIR 6912847"
		)
		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2024-02-14")!,
			value: 0.00,
			movementName:
				"Datenschutzhinweis ab 28.02.2024: Wir übermitteln Überweisungsdaten an den Zahlungsdienstleister des Empfängers (ZDE). Eingeschaltete Dienstleister können erforderliche Prüfungen zur Verhinderung von Zah- lungsverkehrsbetrug vornehmen. Der ZDE kann d"
		)
		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2023-07-08")!,
			value: -120.00,
			movementName: "Bargeldauszahlung Commerzbank 00210074"
		)
		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2023-07-06")!,
			value: -15.11,
			movementName: "Kartenzahlung ARAL Some place Stra-e 7"
		)
		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2023-06-30")!,
			value: 0.00,
			movementName:
				"Periodic balance statement Account  201527900 EUR Bank Code 721 400 52 from 31.03.2023 to 30.06.2023 Balance after closing                     1.283,80  EUR re.: approval of the balancing"
		)
		checkMovement(
			transactions: transactions.list,
			date: DateOnly("2023-06-20")!,
			value: 500.00,
			movementName: "Jaume Singla Valls"
		)
	}
}
