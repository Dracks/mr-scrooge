import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("MrScroogePipelineTests")
final class PipelineErrorTests {
	// var importerService: NewImportService!
	private func withApp(_ test: (Application) async throws -> Void) async throws {
		let app = try await Application.make(.testing)
		do {
			try await configure(app)
			let group = UserGroup(name: "Test User Group")
			try await group.save(on: app.db)

			try await test(app)
		} catch {
			try await app.asyncShutdown()
			throw error
		}
		try await app.asyncShutdown()
	}

	@Test("Test Hello World Route")
	func regexFile() async throws {
		try await withApp { app in
			app.logger.info("test Regex")
			let regex = try Regex("^[A-Z]{2}(?:[ ]?[0-9]){18,20}_")

			let fileTest = "DE19821450020041545900_EUR_11-08-2024_2056.csv"
			let match = try? regex.firstMatch(in: fileTest)
			#expect(match != nil)
		}
	}

}
