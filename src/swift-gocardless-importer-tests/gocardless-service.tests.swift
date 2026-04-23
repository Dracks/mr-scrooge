import Fluent
import GoCardlessImporter
import OpenAPIClient
import Testing
import VaporTesting

@Suite("Gocardless Service Tests")
struct GocardlessServiceTests {
	@Test("GocardlessInstitutionCredentials setTokens stores tokens correctly")
	func testSetTokensStoresTokens() async throws {
		let credentials = GocardlessInstitutionCredentials(
			userId: UUID(),
			secretId: "test-secret-id",
			secretKey: "test-secret-key"
		)
		credentials.setTokens(access: "test-access", refresh: "test-refresh", expiresIn: 3600)

		#expect(credentials.accessToken == "test-access")
		#expect(credentials.refreshToken == "test-refresh")
		#expect(credentials.accessTokenExpiresAt != nil)
	}

	@Test("GocardlessInstitutionCredentials isTokenExpired returns false for valid token")
	func testIsTokenNotExpired() async throws {
		let credentials = GocardlessInstitutionCredentials(
			userId: UUID(),
			secretId: "test-secret-id",
			secretKey: "test-secret-key"
		)
		credentials.setTokens(access: "test-access", refresh: "test-refresh", expiresIn: 3600)

		#expect(credentials.isTokenExpired == false)
	}

	@Test("GocardlessInstitutionCredentials isTokenExpired returns true when no expiration")
	func testIsTokenExpiredNoExpiration() async throws {
		let credentials = GocardlessInstitutionCredentials(
			userId: UUID(),
			secretId: "test-secret-id",
			secretKey: "test-secret-key"
		)

		#expect(credentials.isTokenExpired == true)
	}

	@Test("GocardlessInstitutionCredentials isTokenExpired returns true for expired token")
	func testIsTokenExpiredWithPastDate() async throws {
		let credentials = GocardlessInstitutionCredentials(
			userId: UUID(),
			secretId: "test-secret-id",
			secretKey: "test-secret-key"
		)
		credentials.setTokens(access: "test-access", refresh: "test-refresh", expiresIn: -3600)

		#expect(credentials.isTokenExpired == true)
	}

	@Test("GocardlessService createConfiguration sets baseURL")
	func testCreateConfiguration() async throws {
		let config = GocardlessService.createConfiguration()

		#expect(config.basePath == "https://bankaccountdata.memo1.eu")
	}

	@Test("GocardlessService createConfiguration with access token sets token")
	func testCreateConfigurationWithToken() async throws {
		let config = GocardlessService.createConfiguration(accessToken: "test-token")

		#expect(config.accessToken == "test-token")
	}
}