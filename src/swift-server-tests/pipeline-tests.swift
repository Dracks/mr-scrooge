import Foundation
import XCTest

@testable import MrScroogeServer

final class PipelineErrorTests: BaseImporterTests {
	override func getParsers() throws -> [any ParserFactory] {
		return [CommerzBankEnImporter()]
	}

	func testRegexFile() async throws {
		let factory = importerService.getParsers().first

		XCTAssertNotNil(factory)

		let regex = try Regex(factory!.fileRegex)

		let fileTest = "DE19821450020041545900_EUR_11-08-2024_2056.csv"
		let match = try? regex.firstMatch(in: fileTest)
		XCTAssertNotNil(match)
	}
}
