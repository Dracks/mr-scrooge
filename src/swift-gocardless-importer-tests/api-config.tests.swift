import Exceptions
import Fluent
import GoCardlessClient
import Testing
import VaporTesting

@testable import GoCardlessImporter

@Suite("GoCardlessCredentials apiConfig Tests")
struct GocardlessCredentialsApiConfigTests {

    @Test("Returns config with auth header when token is not expired")
    func testApiConfigWithValidToken() async throws {
        try await withImporterApp { app in
            let futureDate = Date().addingTimeInterval(3600)
            let testUser = try await CreateTestUser(username: "testuser", on: app)

            let credentials = GocardlessCredentials(
                userId: try testUser.user.requireID(),
                secretId: "test-secret-id",
                secretKey: "test-secret-key",
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
                accessTokenExpiresAt: futureDate
            )
            try await credentials.save(on: app.db)

            let config = try await credentials.apiConfig(client: app.client, on: app.db)

            #expect(config.customHeaders["Authorization"].first == "Bearer valid-access-token")
        }
    }

    @Test("Refreshes token when expired and returns new auth header")
    func testApiConfigRefreshesExpiredToken() async throws {
        let pastDate = Date().addingTimeInterval(-3600)

        try await withImporterApp(useMocks: [
            .init(
                method: .POST,
                endpoint: "/api/v2/token/refresh/",
                response: .json(
                    status: .ok,
                    body: SpectacularJWTRefresh(
                        access: "new-access-token",
                        accessExpires: 86400
                    )
                )
            )
        ]) { app in
            let testUser = try await CreateTestUser(username: "testuser", on: app)

            let credentials = GocardlessCredentials(
                userId: try testUser.user.requireID(),
                secretId: "test-secret-id",
                secretKey: "test-secret-key",
                accessToken: "old-access-token",
                refreshToken: "valid-refresh-token",
                accessTokenExpiresAt: pastDate
            )
            try await credentials.save(on: app.db)

            let config = try await credentials.apiConfig(client: app.client, on: app.db)

            #expect(config.customHeaders["Authorization"].first == "Bearer new-access-token")

            let saved = try await GocardlessCredentials.query(on: app.db).first()
            #expect(saved?.accessToken == "new-access-token")
        }
    }

    @Test("Throws error when refresh response has no access token")
    func testApiConfigThrowsOnMissingAccessInResponse() async throws {
        let pastDate = Date().addingTimeInterval(-3600)

        try await withImporterApp(useMocks: [
            .init(
                method: .POST,
                endpoint: "/api/v2/token/refresh/",
                response: .json(
                    status: .ok,
                    body: SpectacularJWTRefresh(
                        access: nil,
                        accessExpires: nil
                    )
                )
            )
        ]) { app in
            let testUser = try await CreateTestUser(username: "testuser", on: app)

            let credentials = GocardlessCredentials(
                userId: try testUser.user.requireID(),
                secretId: "test-secret-id",
                secretKey: "test-secret-key",
                accessToken: "old-access-token",
                refreshToken: "valid-refresh-token",
                accessTokenExpiresAt: pastDate
            )
            try await credentials.save(on: app.db)

            await #expect(throws: Exception<ErrorCodes>.self) {
                try await credentials.apiConfig(client: app.client, on: app.db)
            }
        }
    }

    @Test("Clears access token when expired and no refresh token")
    func testApiConfigClearsTokenWhenExpiredWithoutRefresh() async throws {
        let pastDate = Date().addingTimeInterval(-3600)

        try await withImporterApp { app in
            let testUser = try await CreateTestUser(username: "testuser", on: app)

            let credentials = GocardlessCredentials(
                userId: try testUser.user.requireID(),
                secretId: "test-secret-id",
                secretKey: "test-secret-key",
                accessToken: "expired-access-token",
                refreshToken: nil,
                accessTokenExpiresAt: pastDate
            )
            try await credentials.save(on: app.db)

            let config = try await credentials.apiConfig(client: app.client, on: app.db)

            #expect(config.customHeaders["Authorization"].isEmpty)

            let saved = try await GocardlessCredentials.query(on: app.db).first()
            #expect(saved?.accessToken == nil)
        }
    }

    @Test("Returns config without auth header when no access token exists")
    func testApiConfigWithoutAccessToken() async throws {
        try await withImporterApp { app in
            let testUser = try await CreateTestUser(username: "testuser", on: app)

            let credentials = GocardlessCredentials(
                userId: try testUser.user.requireID(),
                secretId: "test-secret-id",
                secretKey: "test-secret-key",
                accessToken: nil,
                refreshToken: nil,
                accessTokenExpiresAt: nil
            )
            try await credentials.save(on: app.db)

            let config = try await credentials.apiConfig(client: app.client, on: app.db)

            #expect(config.customHeaders["Authorization"].isEmpty)
        }
    }
}
