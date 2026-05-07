import AsyncHTTPClient
import Fluent
import Testing
import VaporTesting

@testable import GoCardlessImporter

@Suite("Accounts Controller - Root Page Tests")
struct AccountsRootPageTests {
	@Test("Root accounts page returns error for unauthenticated user")
	func testRootAccountsPageUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(.GET, "/gcl-accounts")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 401"))
		}
	}

	@Test("Root accounts page shows empty state when user has no credentials")
	func testRootAccountsPageNoCredentials() async throws {
		try await withImporterApp(useMockHTTPClient: true) { app in
			let user = User(externalId: UUID(), username: "testuser")
			try await user.save(on: app.db)

			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/gcl-accounts",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("No Bank Accounts Connected"))
		}
	}

	@Test("Root accounts page shows empty state when no agreements exist")
	func testRootAccountsPageEmptyState() async throws {
		try await withImporterApp(useMockHTTPClient: true) { app in
			let user = try await TestHelpers.createAuthenticatedUserWithCredentials(
				app: app)
			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/gcl-accounts",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("No Bank Accounts Connected"))
			#expect(body.contains("Add Account"))
		}
	}

	@Test("Country selection page returns error for unauthenticated user")
	func testCountrySelectionUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(.GET, "/institutions/add/new")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 401"))
		}
	}

	@Test("Country selection page shows country dropdown")
	func testCountrySelectionShowsDropdown() async throws {
		try await withImporterApp { app in
			let user = User(externalId: UUID(), username: "testuser")
			try await user.save(on: app.db)
			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions/add/new",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Select Country"))
			#expect(body.contains("Spain"))
			#expect(body.contains("Germany"))
			#expect(body.contains("France"))
		}
	}

	@Test("Institutions page returns error for unauthenticated user")
	func testInstitutionsPageUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET, "/institutions/add/list?country=ES")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 401"))
		}
	}

	@Test("Institutions page returns error without country parameter")
	func testInstitutionsPageMissingCountry() async throws {
		try await withImporterApp(useMockHTTPClient: true) { app in
			let user = try await TestHelpers.createAuthenticatedUserWithCredentials(
				app: app)
			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions/add/list",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 400"))
		}
	}
}

@Suite("User Agreements Controller Tests")
struct UserAgreementsControllerTests {
	@Test("Agreements list returns error for unauthenticated user")
	func testAgreementsListUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET, "/institutions")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 401"))
		}
	}

	@Test("Agreements list shows empty state when no agreements exist")
	func testAgreementsListEmptyState() async throws {
		try await withImporterApp(useMockHTTPClient: true) { app in
			let user = try await TestHelpers.createAuthenticatedUserWithCredentials(
				app: app)
			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("No Agreements"))
		}
	}

	@Test("Agreements list shows agreements")
	func testAgreementsListShowsAgreements() async throws {
		try await withImporterApp(useMockHTTPClient: true) { app in
			let user = try await TestHelpers.createAuthenticatedUserWithCredentials(
				app: app)
			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let requisitionId = UUID()
			let agreement = UserAgreement(
				userId: try user.requireID(),
				agreementId: UUID(),
				institutionId: "TEST_INSTITUTION",
				institutionName: "Test Bank",
				status: "approved",
				requisitionId: requisitionId
			)
			try await agreement.save(on: app.db)

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Test Bank"))
			#expect(body.contains("approved"))
			#expect(body.contains(String(describing: requisitionId).prefix(8)))
		}
	}

	@Test("Callback without ref parameter returns error")
	func testCallbackMissingRef() async throws {
		try await withImporterApp { app in
			let user = User(externalId: UUID(), username: "testuser")
			try await user.save(on: app.db)
			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions/created",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 400"))
		}
	}

	@Test("Callback with ref but no matching agreement shows pending message")
	func testCallbackNoMatchingAgreement() async throws {
		try await withImporterApp { app in
			let user = User(externalId: UUID(), username: "testuser")
			try await user.save(on: app.db)
			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let nonExistentRef = UUID()
			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions/created?ref=\(nonExistentRef)",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains(String(describing: nonExistentRef).prefix(8)))
			#expect(body.contains("will be processed shortly"))
		}
	}

	@Test("Callback with matching ref updates agreement status")
	func testCallbackUpdatesAgreementStatus() async throws {
		try await withImporterApp { app in
			let user = User(externalId: UUID(), username: "testuser")
			try await user.save(on: app.db)

			let matchingRef = UUID()
			let agreement = UserAgreement(
				userId: try user.requireID(),
				agreementId: UUID(),
				institutionId: "TEST_INSTITUTION",
				institutionName: "Test Bank",
				status: "pending",
				requisitionId: matchingRef
			)
			try await agreement.save(on: app.db)

			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions/created?ref=\(matchingRef)",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains(String(describing: matchingRef).prefix(8)))
			#expect(body.contains("Test Bank"))
			#expect(body.contains("has been approved"))

			let updatedAgreement = try await UserAgreement.query(on: app.db)
				.filter(\.$requisitionId == matchingRef)
				.first()
			#expect(updatedAgreement?.status == "approved")
		}
	}

	@Test("Delete agreement returns error for unauthenticated user")
	func testDeleteAgreementUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.POST,
				"/institutions/00000000-0000-0000-0000-000000000000/delete"
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 401"))
		}
	}

	@Test("Delete agreement returns error for non-existent agreement")
	func testDeleteAgreementNotFound() async throws {
		try await withImporterApp { app in
			let user = User(externalId: UUID(), username: "testuser")
			try await user.save(on: app.db)
			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.POST,
				"/institutions/00000000-0000-0000-0000-000000000000/delete",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 404"))
		}
	}

	@Test("Delete agreement removes agreement and redirects")
	func testDeleteAgreementSuccess() async throws {
		try await withImporterApp(useMockHTTPClient: true) { app in
			let user = try await TestHelpers.createAuthenticatedUserWithCredentials(
				app: app)
			let headers = try await TestHelpers.loginHeaders(for: user, on: app)

			let agreement = UserAgreement(
				userId: try user.requireID(),
				agreementId: UUID(),
				institutionId: "TEST_INSTITUTION",
				institutionName: "Test Bank",
				status: "active",
				requisitionId: UUID()
			)
			try await agreement.save(on: app.db)

			let agreementId = try agreement.requireID()

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.POST,
				"/institutions/\(agreementId)/delete",
				headers: headers
			)

			#expect(response.status == .seeOther)
			#expect(response.headers["Location"].first == "/institutions")

			let count = try await UserAgreement.query(on: app.db).count()
			#expect(count == 0)
		}
	}

	@Test("Delete agreement only removes own agreements")
	func testDeleteAgreementCannotDeleteOthers() async throws {
		try await withImporterApp(useMockHTTPClient: true) { app in
			let user1 = try await TestHelpers.createAuthenticatedUserWithCredentials(
				app: app)
			let user2 = User(externalId: UUID(), username: "otheruser")
			try await user2.save(on: app.db)

			let credentials = GocardlessInstitutionCredentials(
				userId: try user2.requireID(),
				secretId: "test-secret-id",
				secretKey: "test-secret-key"
			)
			try await credentials.save(on: app.db)

			let agreement = UserAgreement(
				userId: try user2.requireID(),
				agreementId: UUID(),
				institutionId: "TEST_INSTITUTION",
				institutionName: "Test Bank",
				status: "active",
				requisitionId: UUID()
			)
			try await agreement.save(on: app.db)

			let agreementId = try agreement.requireID()
			let headers = try await TestHelpers.loginHeaders(for: user1, on: app)

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.POST,
				"/institutions/\(agreementId)/delete",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 404"))

			let count = try await UserAgreement.query(on: app.db).count()
			#expect(count == 1)
		}
	}
}

// MARK: - Test Helpers

private final class MockHTTPClientHolder {
	var client: HTTPClient?

	init(_ client: HTTPClient) {
		self.client = client
	}

	deinit {
		if let client = client {
			try? client.syncShutdown()
		}
	}
}

/* private func withImporterApp(
	useMockHTTPClient: Bool = false,
	_ extraConfigure: ((Application) async throws -> Void)? = nil,
	_ test: @escaping (Application) async throws -> Void
) async throws {
	let app = try await Application.make(.testing)

	try await configureImporter(app)

	var mockHolder: MockHTTPClientHolder?
	if useMockHTTPClient {
		let mockClient = HTTPClient(eventLoopGroupProvider: .singleton)
		app.injectMockHTTPClient(mockClient)
		mockHolder = MockHTTPClientHolder(mockClient)
	}

	try await extraConfigure?(app)
	try await app.autoMigrate()

	app.routes.get("test-login", ":userId") { req -> Response in
		guard let userIdString = req.parameters.get("userId"),
			let userId = UUID(uuidString: userIdString)
		else {
			return Response(status: .badRequest)
		}
		let user = try await User.find(userId, on: req.db)
		guard let user = user else {
			return Response(status: .notFound)
		}
		req.auth.login(user)
		return Response(status: .ok)
	}

	try await test(app)
	try await app.asyncShutdown()
	_ = mockHolder
} */

