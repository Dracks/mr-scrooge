import AsyncHTTPClient
import Fluent
import GoCardlessClient
import Testing
import VaporTesting

@testable import GoCardlessImporter

@Suite("Institutions Controller")
struct InstitutionsPageTests {
    
	@Test("Country selection page returns error for unauthenticated user")
	func testCountrySelectionUnauthenticated() async throws {
		try await withImporterApp { app in
			let tester = try app.testing()
			let response = try await tester.sendRequest(.GET, "/institutions/add")

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 401"))
		}
	}

	@Test("Country selection page shows country dropdown")
	func testCountrySelectionShowsDropdown() async throws {
		try await withImporterApp { app in
			let headers = try await CreateTestUser(username: "testuser", on: app)
				.getCookie()

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions/add",
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

	@Test("Country selected show the institutions from gocardless")
	func testCountrySelected() async throws {
		try await withImporterApp(useMocks: [
			.init(
				method: .GET, endpoint: "/api/v2/institutions/",
				response: .json(
					status: .ok,
					body: [
						Integration(
							id: "1", name: "N26 Spain",
							countries: ["Spain", "Germany"],
							logo: "http://n26/logo")
					]))
		]) { app in
			let headers = try await CreateTestUser(username: "testuser", on: app)
				.addCredentials().getCookie()
			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions/add?country=SP",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("N26 Spain"))
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
		try await withImporterApp { app in
			let headers = try await CreateTestUser(username: "testuser", on: app)
				.addCredentials().getCookie()

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

@Suite("Show Available Accounts")
struct ShowAvailableAccountsTests {

	@Test("Shows available accounts for approved agreement")
	func testShowAvailableAccountsHappyPath() async throws {
		let accountId = UUID()
		let requisitionId = UUID()

		try await withImporterApp(useMocks: [
			.init(
				method: .GET, endpoint: "/api/v2/requisitions/\(requisitionId)/",
				response: .json(
					status: .ok,
					body: Requisition(
						id: requisitionId,
						redirect: "https://example.com/redirect",
						institutionId: "TEST_INST",
						accounts: [accountId]
					))
			),
			.init(
				method: .GET,
				endpoint: "/api/v2/accounts/\(accountId)/details/",
				response: .json(
					status: .ok,
					body: AccountDetail(
						account: DetailSchema(
							iban: "ES123456789",
							ownerName: "Test Owner",
							name: "Test Account",
							status: "active"
						))
				)
			),
		]) { app in
			let builder = CreateTestUser(username: "testuser", on: app)
				.addCredentials()
			let user = try await builder.build()
			let headers = try await builder.getCookie()

			let agreement = UserAgreement(
				userId: try user.requireID(),
				agreementId: UUID(),
				institutionId: "TEST_INST",
				institutionName: "Test Bank",
				status: "approved",
				requisitionId: requisitionId
			)
			try await agreement.save(on: app.db)
			let agreementId = try agreement.requireID()

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions/\(agreementId)/add-accounts",
				headers: headers
			)

			#expect(response.status == .ok)
			let body = String(buffer: response.body)
			#expect(body.contains("Select Bank Accounts"))
			#expect(body.contains("ES123456789"))
			#expect(body.contains("Test Owner"))
		}
	}

	@Test("Shows error when agreement not approved")
	func testShowAvailableAccountsNotApproved() async throws {
		let requisitionId = UUID()

		try await withImporterApp { app in
			let builder = CreateTestUser(username: "testuser", on: app)
				.addCredentials()
			let user = try await builder.build()
			let headers = try await builder.getCookie()

			let agreement = UserAgreement(
				userId: try user.requireID(),
				agreementId: UUID(),
				institutionId: "TEST_INST",
				institutionName: "Test Bank",
				status: "pending",
				requisitionId: requisitionId
			)
			try await agreement.save(on: app.db)
			let agreementId = try agreement.requireID()

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions/\(agreementId)/add-accounts",
				headers: headers
			)

			#expect(response.status == .badRequest)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 400"))
		}
	}

	@Test("Shows error when agreement not found")
	func testShowAvailableAccountsNotFound() async throws {
		try await withImporterApp { app in
			let headers = try await CreateTestUser(username: "testuser", on: app)
				.addCredentials().getCookie()

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.GET,
				"/institutions/\(UUID())/add-accounts",
				headers: headers
			)

			#expect(response.status == .notFound)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 404"))
		}
	}
}

@Suite("Select Accounts")
struct SelectAccountsTests {

	@Test("Selects accounts and redirects")
	func testSelectAccountsHappyPath() async throws {
		let accountId = "test-account-id"
		let requisitionId = UUID()

		try await withImporterApp(useMocks: [
			.init(
				method: .GET,
				endpoint: "/api/v2/accounts/\(accountId)/details/",
				response: .json(
					status: .ok,
					body: AccountDetail(
						account: DetailSchema(
							iban: "ES123456789",
							ownerName: "Test Owner",
							name: "Test Account",
							status: "active"
						))
				)
			),
		]) { app in
			let builder = CreateTestUser(username: "testuser", on: app)
				.addCredentials()
			let user = try await builder.build()
			let headers = try await builder.getCookie()

			let agreement = UserAgreement(
				userId: try user.requireID(),
				agreementId: UUID(),
				institutionId: "TEST_INST",
				institutionName: "Test Bank",
				status: "approved",
				requisitionId: requisitionId
			)
			try await agreement.save(on: app.db)
			let agreementId = try agreement.requireID()

			var postHeaders = headers
			postHeaders.add(name: "content-type", value: "application/json")

			let bodyData = try JSONEncoder().encode(["accountIds": [accountId]])

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.POST,
				"/institutions/\(agreementId)/add-accounts",
				headers: postHeaders,
				body: ByteBuffer(data: bodyData)
			)

			#expect(response.status == .seeOther)
			#expect(response.headers["Location"].first == "/institutions")

			let bankAccounts = try await GocardlessBankAccount.query(on: app.db).all()
			#expect(bankAccounts.count == 1)
			#expect(bankAccounts.first?.accountId == accountId)
			#expect(bankAccounts.first?.institutionName == "Test Bank")
			#expect(bankAccounts.first?.iban == "ES123456789")
		}
	}

	@Test("Returns error when no accounts selected")
	func testSelectAccountsEmpty() async throws {
		let requisitionId = UUID()

		try await withImporterApp { app in
			let builder = CreateTestUser(username: "testuser", on: app)
				.addCredentials()
			let user = try await builder.build()
			let headers = try await builder.getCookie()

			let agreement = UserAgreement(
				userId: try user.requireID(),
				agreementId: UUID(),
				institutionId: "TEST_INST",
				institutionName: "Test Bank",
				status: "approved",
				requisitionId: requisitionId
			)
			try await agreement.save(on: app.db)
			let agreementId = try agreement.requireID()

			var postHeaders = headers
			postHeaders.add(name: "content-type", value: "application/json")

			let bodyData = try JSONEncoder().encode(["accountIds": [] as [String]])

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.POST,
				"/institutions/\(agreementId)/add-accounts",
				headers: postHeaders,
				body: ByteBuffer(data: bodyData)
			)

			#expect(response.status == .badRequest)
			let body = String(buffer: response.body)
			#expect(body.contains("Error 400"))
		}
	}

	@Test("Does not duplicate existing accounts")
	func testSelectAccountsSkipsExisting() async throws {
		let accountId = "existing-acc"
		let requisitionId = UUID()

		try await withImporterApp(useMocks: [
			.init(
				method: .GET,
				endpoint: "/api/v2/accounts/\(accountId)/details/",
				response: .json(
					status: .ok,
					body: AccountDetail(
						account: DetailSchema(
							iban: "ES987654321",
							ownerName: "Existing Owner",
							name: "Existing Account",
							status: "active"
						))
				)
			),
		]) { app in
			let builder = CreateTestUser(username: "testuser", on: app)
				.addCredentials()
			let user = try await builder.build()
			let headers = try await builder.getCookie()

			let agreement = UserAgreement(
				userId: try user.requireID(),
				agreementId: UUID(),
				institutionId: "TEST_INST",
				institutionName: "Test Bank",
				status: "approved",
				requisitionId: requisitionId
			)
			try await agreement.save(on: app.db)
			let agreementId = try agreement.requireID()

			let existingAccount = GocardlessBankAccount(
				userId: try user.requireID(),
				agreementId: agreementId,
				accountId: accountId,
				institutionId: "TEST_INST",
				institutionName: "Test Bank",
				iban: "ES987654321",
				status: "active",
				name: "Existing Account"
			)
			try await existingAccount.save(on: app.db)

			var postHeaders = headers
			postHeaders.add(name: "content-type", value: "application/json")

			let bodyData = try JSONEncoder().encode(["accountIds": [accountId]])

			let tester = try app.testing()
			let response = try await tester.sendRequest(
				.POST,
				"/institutions/\(agreementId)/add-accounts",
				headers: postHeaders,
				body: ByteBuffer(data: bodyData)
			)

			#expect(response.status == .seeOther)

			let count = try await GocardlessBankAccount.query(on: app.db).count()
			#expect(count == 1)
		}
	}
}
