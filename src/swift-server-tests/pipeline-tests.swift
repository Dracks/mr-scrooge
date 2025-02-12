import Foundation
import XCTVapor
import XCTest

@testable import MrScroogeServer

final class PipelineErrorTests: XCTestCase {
	var importerService: NewImportService!
	var app: Application?

	override func setUp() async throws {
		try await super.setUp()

		let app = try await Application.make(.testing)
		try await configure(app)

		app.queues.use(.asyncTest)

		self.app = app

		let group = UserGroup(name: "Test User Group")
		try await group.save(on: app.db)
		// self.group = group
		print("UserCreated")

		let testParsers: [ParserFactory] = try getParsers()
		importerService = NewImportService(parsers: testParsers, withApp: app)
		print("Set Up Correctly")
	}

	override func tearDown() async throws {
		try await super.tearDown()
		print("Tearing down")
		if let app {
			try await app.asyncShutdown()
			print("Async shutdown")
			self.app = nil
			print("Finish")
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
