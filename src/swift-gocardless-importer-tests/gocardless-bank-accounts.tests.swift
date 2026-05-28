import Fluent
import Testing
import VaporTesting

@testable import GoCardlessImporter

	@Suite("GoCardless Bank Account Source Tests")
struct GocardlessBankAccountSourceTests {

	@Test("Auto-fills source with gocardless/institution-name/account-name")
	func testSourceAutoFill() async throws {
		try await withImporterApp { app in
			let builder = try await CreateTestUser(username: "testuser", on: app).setCredentials()
			let user = builder.user
			let userId = try user.requireID()

			let agreement = UserAgreement(
				userId: userId,
				agreementId: UUID(),
				institutionId: "TEST_INST",
				institutionName: "Test Bank",
				status: "approved",
				requisitionId: UUID()
			)
			try await agreement.save(on: app.db)
			let agreementId = try agreement.requireID()

			let bankAccount = GocardlessBankAccount(
				userId: userId,
				agreementId: agreementId,
				accountId: "acc-1",
				institutionId: "TEST_INST",
				institutionName: "Test Bank",
				iban: "ES123456789",
				status: "active",
				name: "My Account"
			)
			try await bankAccount.save(on: app.db)

			let saved = try await GocardlessBankAccount.query(on: app.db)
				.filter(\.$id == bankAccount.id!)
				.first()

			#expect(saved?.source == "gocardless/Test Bank/My Account")
		}
	}

	@Test("Defaults to unknown when account name is nil")
	func testSourceDefaultsToUnknown() async throws {
		try await withImporterApp { app in
			let builder = try await CreateTestUser(username: "testuser", on: app).setCredentials()
			let user = builder.user
			let userId = try user.requireID()

			let agreement = UserAgreement(
				userId: userId,
				agreementId: UUID(),
				institutionId: "INGBANK",
				institutionName: "ING Bank",
				status: "approved",
				requisitionId: UUID()
			)
			try await agreement.save(on: app.db)
			let agreementId = try agreement.requireID()

			let bankAccount = GocardlessBankAccount(
				userId: userId,
				agreementId: agreementId,
				accountId: "acc-2",
				institutionId: "INGBANK",
				institutionName: "ING Bank",
				iban: "NL12ING0001234567",
				status: "active",
				name: nil
			)
			try await bankAccount.save(on: app.db)

			let saved = try await GocardlessBankAccount.query(on: app.db)
				.filter(\.$id == bankAccount.id!)
				.first()

			#expect(saved?.source == "gocardless/ING Bank/unknown")
		}
	}

	@Test("Accepts user-provided source overriding auto-fill")
	func testUserProvidedSource() async throws {
		try await withImporterApp { app in
			let builder = try await CreateTestUser(username: "testuser", on: app).setCredentials()
			let user = builder.user
			let userId = try user.requireID()

			let agreement = UserAgreement(
				userId: userId,
				agreementId: UUID(),
				institutionId: "TEST_INST",
				institutionName: "Test Bank",
				status: "approved",
				requisitionId: UUID()
			)
			try await agreement.save(on: app.db)
			let agreementId = try agreement.requireID()

			let bankAccount = GocardlessBankAccount(
				userId: userId,
				agreementId: agreementId,
				accountId: "acc-4",
				institutionId: "TEST_INST",
				institutionName: "Test Bank",
				iban: "ES987654321",
				status: "active",
				name: "My Account",
				source: "custom-source"
			)
			try await bankAccount.save(on: app.db)

			let saved = try await GocardlessBankAccount.query(on: app.db)
				.filter(\.$id == bankAccount.id!)
				.first()

			#expect(saved?.source == "custom-source")
			#expect(saved?.source != "gocardless/Test Bank/My Account")
		}
	}
}
