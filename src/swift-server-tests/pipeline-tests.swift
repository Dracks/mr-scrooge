import Foundation
import XCTVapor
import XCTest

@testable import MrScroogeServer

final class PipelineErrorTests: XCTestCase {
	var importerService: NewImportService!
	var group: UserGroup?
	var app: Application?

	override func setUp() async throws {
		try await super.setUp()
		do {
			let app = try await Application.make(.testing)
			try await configure(app)

			print("Starting auto-migration")
			try await app.autoMigrate()
			print("Finishing auto-migration")

			self.app = app

			let group = UserGroup(name: "Test User Group")
			try await group.save(on: app.db)
			// self.group = group
			print("UserCreated")

			let testParsers: [ParserFactory] = try getParsers()
			importerService = NewImportService(parsers: testParsers, withApp: app)
			print("Set Up Correctly")
		} catch {
			print("importer-helper {}", String(reflecting: error))
			XCTAssertTrue(false)
		}
	}

	override func tearDown() async throws {
		try await super.tearDown()
		print("Tearing down")
		self.group = nil
		guard let app else {
			throw TestError()
		}
		do {
			try await app.asyncShutdown()
			print("Async shutdown")
			self.app = nil
			print("Finish")
		} catch {
			print("More error catching")
			print(error)
		}
	}

	func getParsers() throws -> [any ParserFactory] {
		return [CommerzBankEnImporter()]
	}

	func testRegexFile() async throws {
		print("Test is starting!")
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

	func te_stUpdateWithInvalidDefaultGroupId() async throws {}
}
