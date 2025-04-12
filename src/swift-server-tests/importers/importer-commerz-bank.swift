import Fluent
import Queues
import Testing
import Vapor
import VaporTesting

@testable import MrScroogeServer

@Suite("CommerzBank En")
final class CommerzBankEnImporterTests: BaseImporterTesting {

	@Test("Test file regex matches")
	func testRegexFile() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [CommerzBankEnImporter()])

			let factory = services.importerService.getParsers().first

			#expect(factory != nil)

			let regex = try Regex(factory!.fileRegex)

			let fileTest = "DE19821450020041545900_EUR_11-08-2024_2056.csv"
			let match = try? regex.firstMatch(in: fileTest)
			#expect(match != nil)
		}
	}

	@Test("Import from Commerz Bank")
	func testInsertingDataInCommerzBank() async throws {
		try await withApp { app in
			let services = ImporterTestServices(
				app: app,
				parsers: [CommerzBankEnImporter()])

			let testData = try await createGroupsAndUsers(app: app)
			let groupOwnerId = try testData.group.requireID()

			let filePath = try #require(
				Bundle.module.url(forResource: "commerz_bank", withExtension: "CSV")
			)

			let _ = try await services.importerService.importFromFile(
				on: app.db, withQueue: app.queues.queue,
				groupOwnerId: groupOwnerId,
				key: "commerz-bank-2024/en",
				fileName: "CommerzBank",
				filePath: filePath.path)

			let reports = try await services.statusReportsService.getAll(
				groupIds: [groupOwnerId])
			#expect(reports.list.count == 1)
			#expect(reports.list.first?.status == .ok)
			#expect(reports.list.first?.description == "")
			#expect(reports.list.first?.context == nil)

			let (transactions, _) = try await services.bankTransactionService.getAll(
				groupIds: [groupOwnerId])
			#expect(transactions.list.count == 12)

			let debitCardTransaction = transactions.list.first {
				$0.date == DateOnly("2024-04-23")
			}
			#expect(debitCardTransaction != nil)
			#expect(debitCardTransaction?.value == -15.00)
			#expect(
				debitCardTransaction?.movementName
					== "AUSGABE EINER DEBITKARTE ENTGELT ERSATZKARTE GIROCARD")

			let energyTransaction = transactions.list.first {
				$0.date == DateOnly("2024-03-12")
			}
			#expect(energyTransaction != nil)
			#expect(energyTransaction?.value == -20.55)
			#expect(
				energyTransaction?.movementName
					== "Stadtwerke Ingolstadt Energie GmbH E-Mobility Rechnung Nr. 56315 zu Ve rtrag 704860, Kundennummer 718838"
			)

			let pharmacyTransaction = transactions.list.first {
				$0.date == DateOnly("2024-03-10")
			}
			#expect(pharmacyTransaction != nil)
			#expect(pharmacyTransaction?.value == -24.93)
			#expect(
				pharmacyTransaction?.movementName
					== "Stadtapotheke Stephan Kurzeder e.K.")

			let edekaTransaction = transactions.list.first {
				$0.date == DateOnly("2024-03-04")
			}
			#expect(edekaTransaction != nil)
			#expect(edekaTransaction?.value == -20.12)
			#expect(edekaTransaction?.movementName == "85053 EDEKA FANDERL")

			let mediaMarktTransaction = transactions.list.first {
				$0.date == DateOnly("2024-03-01")
			}
			#expect(mediaMarktTransaction != nil)
			#expect(mediaMarktTransaction?.value == -45.99)
			#expect(mediaMarktTransaction?.movementName == "M001-MEDIA MARKT")

			let bauhausTransaction = transactions.list.first {
				$0.date == DateOnly("2024-02-29")
			}
			#expect(bauhausTransaction != nil)
			#expect(bauhausTransaction?.value == -22.35)
			#expect(
				bauhausTransaction?.movementName
					== "BAUHAUS SOMEPLACE - DANKE 270217190097028271201056880 ELV6512 0607 27.02 17.19 ME0"
			)

			let airportTransaction = transactions.list.first {
				$0.date == DateOnly("2024-02-18")
			}
			#expect(airportTransaction != nil)
			#expect(airportTransaction?.value == -8.00)
			#expect(
				airportTransaction?.movementName
					== "FLUGHAFEN MUENCHEN GMBH GIR 6912847")

			let privacyNoticeTransaction = transactions.list.first {
				$0.date == DateOnly("2024-02-14")
			}
			#expect(privacyNoticeTransaction != nil)
			#expect(privacyNoticeTransaction?.value == 0.00)
			#expect(
				privacyNoticeTransaction?.movementName
					== "Datenschutzhinweis ab 28.02.2024: Wir übermitteln Überweisungsdaten an den Zahlungsdienstleister des Empfängers (ZDE). Eingeschaltete Dienstleister können erforderliche Prüfungen zur Verhinderung von Zah- lungsverkehrsbetrug vornehmen. Der ZDE kann d"
			)

			let atmTransaction = transactions.list.first {
				$0.date == DateOnly("2023-07-08")
			}
			#expect(atmTransaction != nil)
			#expect(atmTransaction?.value == -120.00)
			#expect(
				atmTransaction?.movementName
					== "Bargeldauszahlung Commerzbank 00210074")

			let aralTransaction = transactions.list.first {
				$0.date == DateOnly("2023-07-06")
			}
			#expect(aralTransaction != nil)
			#expect(aralTransaction?.value == -15.11)
			#expect(
				aralTransaction?.movementName
					== "Kartenzahlung ARAL Some place Stra-e 7")

			let balanceTransaction = transactions.list.first {
				$0.date == DateOnly("2023-06-30")
			}
			#expect(balanceTransaction != nil)
			#expect(balanceTransaction?.value == 0.00)
			#expect(
				balanceTransaction?.movementName
					== "Periodic balance statement Account  201527900 EUR Bank Code 721 400 52 from 31.03.2023 to 30.06.2023 Balance after closing                     1.283,80  EUR re.: approval of the balancing"
			)

			let incomingTransaction = transactions.list.first {
				$0.date == DateOnly("2023-06-20")
			}
			#expect(incomingTransaction != nil)
			#expect(incomingTransaction?.value == 500.00)
			#expect(incomingTransaction?.movementName == "Jaume Singla Valls")
		}
	}
}
