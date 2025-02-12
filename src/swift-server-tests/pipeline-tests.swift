import Foundation
import XCTVapor
import XCTest

@testable import MrScroogeServer

final class PipelineErrorTests: XCTestCase {
	// var importerService: NewImportService!
	var app: Application?

	override func setUp() async throws {
		try await super.setUp()

		let app = try await Application.make(.testing)
		try await configure(app)

		app.queues.use(.asyncTest)

		self.app = app

		let group = UserGroup(name: "Test User Group")
		try await group.save(on: app.db)
		app.logger.info("User created")

		/*let testParsers: [ParserFactory] = try getParsers()
		importerService = NewImportService(parsers: testParsers, withApp: app)
		print("Set Up Correctly")*/
	}

	override func tearDown() async throws {
		app?.logger.info("Tear down")
		try await super.tearDown()

		if let app {
			app.logger.info("We have app")
			try await app.asyncShutdown()
			app.logger.info("Shutting down")
			self.app = nil
			print("Finish")
		}
	}

	func getParsers() throws -> [any ParserFactory] {
		return [CommerzBankEnImporter()]
	}

	func testRegexFile() async throws {
		app?.logger.info("test Regex")
		/*let factory = importerService.getParsers().first

		XCTAssertNotNil(factory)
		guard let factory else {
			return
		}*/
		let regex = try Regex("^[A-Z]{2}(?:[ ]?[0-9]){18,20}_")

		let fileTest = "DE19821450020041545900_EUR_11-08-2024_2056.csv"
		let match = try? regex.firstMatch(in: fileTest)
		XCTAssertNotNil(match)
	}

	func te_stUpdateWithInvalidDefaultGroupId() async throws {}
}
