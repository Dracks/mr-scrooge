import Vapor
import OpenAPIRuntime
import OpenAPIAsyncHTTPClient
/*
/// Auto-generated GoCardless service using OpenAPI generator
struct GoCardlessAutoService {
    private let client: Client

    init(client: Client) {
        self.client = client
    }

    // MARK: - Authentication

    mutating func getAccessToken(secretId: String, secretKey: String) async throws -> String {
        let requestBody = Components.Schemas.JWTObtainPairRequest(
            secretId: secretId,
            secretKey: secretKey
        )

        let request = try await client.postJWTObtainPair(
            body: .json(requestBody),
            headers: [:]
        )

        guard case .ok(let response) = request else {
            throw Abort(.badGateway, reason: "Failed to get GoCardless access token")
        }

        return response.access
    }

    // MARK: - Institutions

    mutating func getInstitutions(country: String? = nil) async throws -> [Components.Schemas.Institution] {
        let request = try await client.listInstitutions(
            query: .init(
                country: country.map { .string($0) }
            ),
            headers: [:]
        )

        guard case .ok(let response) = request else {
            throw Abort(.badGateway, reason: "Failed to fetch institutions")
        }

        return response.results
    }

    // MARK: - Requisitions

    mutating func createRequisition(
        institutionId: String,
        redirectUrl: String,
        referenceId: String? = nil
    ) async throws -> Components.Schemas.Requisition {
        let requestBody = Components.Schemas.RequisitionRequest(
            institutionId: institutionId,
            redirect: redirectUrl,
            reference: referenceId
        )

        let request = try await client.createRequisition(
            body: .json(requestBody),
            headers: [:]
        )

        guard case .created(let response) = request else {
            throw Abort(.badGateway, reason: "Failed to create requisition")
        }

        return response
    }

    mutating func getRequisition(requisitionId: String) async throws -> Components.Schemas.Requisition {
        let request = try await client.retrieveRequisition(
            path: .init(id: requisitionId),
            headers: [:]
        )

        guard case .ok(let response) = request else {
            throw Abort(.badGateway, reason: "Failed to fetch requisition")
        }

        return response
    }

    // MARK: - Accounts

    mutating func getAccountDetails(accountId: String) async throws -> Components.Schemas.Account {
        let request = try await client.retrieveAccountDetails(
            path: .init(id: accountId),
            headers: [:]
        )

        guard case .ok(let response) = request else {
            throw Abort(.badGateway, reason: "Failed to fetch account details")
        }

        return response
    }
}

// Convenience extension to create the client
extension GoCardlessAutoService {
    static func createClient(
        baseURL: String,
        secretId: String,
        secretKey: String,
        vaporClient: Client
    ) -> GoCardlessAutoService {
        let transportClient = AsyncHTTPClientTransport(
            configuration: .init(
                serverURL: URL(string: baseURL)!,
                client: vaporClient.eventLoopGroup.any(),
                middleware: []
            )
        )

        let runtimeClient = Client(transport: transportClient)
        return GoCardlessAutoService(client: runtimeClient)
    }
}
*/