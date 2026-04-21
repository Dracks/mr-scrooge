import AsyncHTTPClient
import Foundation
import Vapor

// MARK: - GoCardless Models
struct GoCardlessTokenResponse: Codable, Content {
	let access: String
	let accessExpires: Int
	let refresh: String
	let refreshExpires: Int

	enum CodingKeys: String, CodingKey {
		case access
		case accessExpires = "access_expires"
		case refresh
		case refreshExpires = "refresh_expires"
	}
}

struct GoCardlessInstitution: Codable, Content {
	let id: String
	let name: String
	let bic: String
	let countries: [String]
	let logo: String
}

struct GoCardlessEndUserAgreement: Codable, Content {
	let id: String
	let created: String
	let institutionId: String
	let maxHistoricalDays: Int
	let accessValidForDays: Int
	let accessScope: [String]
	let accepted: String?

	enum CodingKeys: String, CodingKey {
		case id
		case created
		case institutionId = "institution_id"
		case maxHistoricalDays = "max_historical_days"
		case accessValidForDays = "access_valid_for_days"
		case accessScope = "access_scope"
		case accepted
	}
}

struct GoCardlessRequisition: Codable, Content {
	let id: String
	let created: String?
	let redirect: String?
	let status: String
	let institutionId: String
	let agreement: String
	let reference: String?
	let accounts: [String]
	let link: String?

	enum CodingKeys: String, CodingKey {
		case id
		case created
		case redirect
		case status
		case institutionId = "institution_id"
		case agreement
		case reference
		case accounts
		case link
	}
}

struct GoCardlessAccount: Codable, Content {
	let id: String
	let created: String
	let lastAccessed: String
	let iban: String
	let status: String
	let institutionId: String
	let ownerName: String?
	let name: String?

	enum CodingKeys: String, CodingKey {
		case id
		case created
		case lastAccessed = "last_accessed"
		case iban
		case status
		case institutionId = "institution_id"
		case ownerName = "owner_name"
		case name
	}
}

struct GoCardlessTransaction: Codable, Content {
	let transactionId: String?
	let bookingDate: String?
	let valueDate: String?
	let transactionAmount: TransactionAmount?
	let creditorName: String?
	let debtorName: String?
	let remittanceInformationUnstructured: String?

	enum CodingKeys: String, CodingKey {
		case transactionId = "transactionId"
		case bookingDate = "bookingDate"
		case valueDate = "valueDate"
		case transactionAmount = "transactionAmount"
		case creditorName = "creditorName"
		case debtorName = "debtorName"
		case remittanceInformationUnstructured = "remittanceInformationUnstructured"
	}
}

struct TransactionAmount: Codable, Content {
	let amount: String
	let currency: String
}

struct GoCardlessTransactionsResponse: Codable, Content {
	let transactions: GoCardlessBankTransaction
	let lastUpdated: String

	enum CodingKeys: String, CodingKey {
		case transactions
		case lastUpdated = "last_updated"
	}
}

struct GoCardlessBankTransaction: Codable, Content {
	let booked: [GoCardlessTransaction]
	let pending: [GoCardlessTransaction]
}

// MARK: - GoCardless Service Error
enum GoCardlessError: Error, LocalizedError {
	case invalidCredentials
	case unauthorized
	case invalidResponse
	case networkError(Error)
	case apiError(String)

	var errorDescription: String? {
		switch self {
		case .invalidCredentials:
			return "Invalid GoCardless credentials"
		case .unauthorized:
			return "Unauthorized access - token may be expired"
		case .invalidResponse:
			return "Invalid response from GoCardless API"
		case .networkError(let error):
			return "Network error: \(error.localizedDescription)"
		case .apiError(let message):
			return "GoCardless API error: \(message)"
		}
	}
}

// MARK: - Main GoCardless Service Class
class GoCardlessService {
	private let client: HTTPClient
	private let baseUrl: String
	private let secretId: String
	private let secretKey: String

	private var accessToken: String?
	private var refreshToken: String?
	private var tokenExpiration: Date?

	init(
		client: HTTPClient,
		baseUrl: String = "https://bankaccountdata.gocardless.com/api/v2", secretId: String,
		secretKey: String
	) {
		self.client = client
		self.baseUrl = baseUrl
		self.secretId = secretId
		self.secretKey = secretKey
	}

	// MARK: - Authentication Methods

	/// Obtains a new access/refresh token pair
	func obtainTokens() async throws {
		let payload = [
			"secret_id": secretId,
			"secret_key": secretKey,
		]

		let body = try JSONSerialization.data(withJSONObject: payload)
		let request = try await createRequest(
			path: "/token/new/", method: .POST, body: body)

		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 200 else {
			if response.status.code == 401 {
				throw GoCardlessError.invalidCredentials
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let tokenResponse = try decoder.decode(
			GoCardlessTokenResponse.self, from: Data(buffer.readableBytesView))

		self.accessToken = tokenResponse.access
		self.refreshToken = tokenResponse.refresh

		// Calculate expiration time (access token expires in tokenResponse.accessExpires seconds)
		let expirationTime = Date().addingTimeInterval(
			TimeInterval(tokenResponse.accessExpires))
		self.tokenExpiration = expirationTime
	}

	/// Refreshes the access token using the refresh token
	func refreshAccessToken() async throws {
		guard let refreshToken = self.refreshToken else {
			throw GoCardlessError.unauthorized
		}

		let payload = [
			"refresh": refreshToken
		]

		let body = try JSONSerialization.data(withJSONObject: payload)
		let request = try await createRequest(
			path: "/token/refresh/", method: .POST, body: body)

		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 200 else {
			if response.status.code == 401 {
				throw GoCardlessError.unauthorized
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let tokenResponse = try decoder.decode(
			GoCardlessTokenResponse.self, from: Data(buffer.readableBytesView))

		self.accessToken = tokenResponse.access

		// Calculate expiration time
		let expirationTime = Date().addingTimeInterval(
			TimeInterval(tokenResponse.accessExpires))
		self.tokenExpiration = expirationTime
	}

	/// Ensures the access token is valid, refreshing if necessary
	private func ensureValidToken() async throws {
		if let tokenExpiration = self.tokenExpiration, Date() >= tokenExpiration {
			// Token has expired, refresh it
			try await refreshAccessToken()
		} else if self.accessToken == nil {
			// No token, obtain new ones
			try await obtainTokens()
		}
	}

	// MARK: - Institution Methods

	/// Retrieves all supported institutions in a given country
	func getInstitutions(country: String? = nil) async throws -> [GoCardlessInstitution] {
		try await ensureValidToken()

		var queryString = ""
		if let country = country {
			queryString = "?country=\(country)"
		}

		let request = try await createRequest(
			path: "/institutions/\(queryString)", method: .GET)
		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 200 else {
			if response.status.code == 401 {
				throw GoCardlessError.unauthorized
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let institutions = try decoder.decode(
			[GoCardlessInstitution].self, from: Data(buffer.readableBytesView))

		return institutions
	}

	/// Retrieves a specific institution by ID
	func getInstitution(id: String) async throws -> GoCardlessInstitution {
		try await ensureValidToken()

		let request = try await createRequest(path: "/institutions/\(id)/", method: .GET)
		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 200 else {
			if response.status.code == 401 {
				throw GoCardlessError.unauthorized
			} else if response.status.code == 404 {
				throw GoCardlessError.apiError(
					"Institution with ID \(id) not found")
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let institution = try decoder.decode(
			GoCardlessInstitution.self, from: Data(buffer.readableBytesView))

		return institution
	}

	// MARK: - End User Agreement Methods

	/// Creates a new end user agreement
	func createEndUserAgreement(
		institutionId: String,
		maxHistoricalDays: Int = 90,
		accessValidForDays: Int = 90,
		accessScope: [String] = ["balances", "details", "transactions"]
	) async throws -> GoCardlessEndUserAgreement {
		try await ensureValidToken()

		let payload: [String: Any] = [
			"institution_id": institutionId,
			"max_historical_days": maxHistoricalDays,
			"access_valid_for_days": accessValidForDays,
			"access_scope": accessScope,
		]

		let body = try JSONSerialization.data(withJSONObject: payload)
		let request = try await createRequest(
			path: "/agreements/enduser/", method: .POST, body: body)

		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 201 else {
			if response.status.code == 401 {
				throw GoCardlessError.unauthorized
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let agreement = try decoder.decode(
			GoCardlessEndUserAgreement.self, from: Data(buffer.readableBytesView))

		return agreement
	}

	/// Retrieves an end user agreement by ID
	func getEndUserAgreement(id: String) async throws -> GoCardlessEndUserAgreement {
		try await ensureValidToken()

		let request = try await createRequest(
			path: "/agreements/enduser/\(id)/", method: .GET)
		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 200 else {
			if response.status.code == 401 {
				throw GoCardlessError.unauthorized
			} else if response.status.code == 404 {
				throw GoCardlessError.apiError(
					"End User Agreement with ID \(id) not found")
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let agreement = try decoder.decode(
			GoCardlessEndUserAgreement.self, from: Data(buffer.readableBytesView))

		return agreement
	}

	/// Accepts an end user agreement
	func acceptEndUserAgreement(id: String, userAgent: String, ipAddress: String) async throws
		-> GoCardlessEndUserAgreement
	{
		try await ensureValidToken()

		let payload: [String: String] = [
			"user_agent": userAgent,
			"ip_address": ipAddress,
		]

		let body = try JSONSerialization.data(withJSONObject: payload)
		let request = try await createRequest(
			path: "/agreements/enduser/\(id)/accept/", method: .PUT, body: body)

		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 200 else {
			if response.status.code == 401 {
				throw GoCardlessError.unauthorized
			} else if response.status.code == 404 {
				throw GoCardlessError.apiError(
					"End User Agreement with ID \(id) not found")
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let agreement = try decoder.decode(
			GoCardlessEndUserAgreement.self, from: Data(buffer.readableBytesView))

		return agreement
	}

	// MARK: - Requisition Methods

	/// Creates a new requisition
	func createRequisition(
		institutionId: String,
		redirectUrl: String,
		agreementId: String? = nil,
		reference: String? = nil,
		userLanguage: String? = nil,
		accountSelection: Bool = false
	) async throws -> GoCardlessRequisition {
		try await ensureValidToken()

		var payload: [String: Any] = [
			"institution_id": institutionId,
			"redirect": redirectUrl,
		]

		if let agreementId = agreementId {
			payload["agreement"] = agreementId
		}

		if let reference = reference {
			payload["reference"] = reference
		}

		if let userLanguage = userLanguage {
			payload["user_language"] = userLanguage
		}

		payload["account_selection"] = accountSelection

		let body = try JSONSerialization.data(withJSONObject: payload)
		let request = try await createRequest(
			path: "/requisitions/", method: .POST, body: body)

		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 201 else {
			if response.status.code == 401 {
				throw GoCardlessError.unauthorized
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let requisition = try decoder.decode(
			GoCardlessRequisition.self, from: Data(buffer.readableBytesView))

		return requisition
	}

	/// Retrieves a requisition by ID
	func getRequisition(id: String) async throws -> GoCardlessRequisition {
		try await ensureValidToken()

		let request = try await createRequest(path: "/requisitions/\(id)/", method: .GET)
		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 200 else {
			if response.status.code == 401 {
				throw GoCardlessError.unauthorized
			} else if response.status.code == 404 {
				throw GoCardlessError.apiError(
					"Requisition with ID \(id) not found")
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let requisition = try decoder.decode(
			GoCardlessRequisition.self, from: Data(buffer.readableBytesView))

		return requisition
	}

	// MARK: - Account Methods

	/// Retrieves account details by ID
	func getAccountDetails(id: String) async throws -> GoCardlessAccount {
		try await ensureValidToken()

		let request = try await createRequest(path: "/accounts/\(id)/", method: .GET)
		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 200 else {
			if response.status.code == 401 {
				throw GoCardlessError.unauthorized
			} else if response.status.code == 404 {
				throw GoCardlessError.apiError("Account with ID \(id) not found")
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let account = try decoder.decode(
			GoCardlessAccount.self, from: Data(buffer.readableBytesView))

		return account
	}

	/// Retrieves account transactions
	func getAccountTransactions(
		id: String,
		dateFrom: String? = nil,
		dateTo: String? = nil
	) async throws -> GoCardlessTransactionsResponse {
		try await ensureValidToken()

		var queryString = ""
		var params: [String] = []

		if let dateFrom = dateFrom {
			params.append("date_from=\(dateFrom)")
		}

		if let dateTo = dateTo {
			params.append("date_to=\(dateTo)")
		}

		if !params.isEmpty {
			queryString = "?" + params.joined(separator: "&")
		}

		let request = try await createRequest(
			path: "/accounts/\(id)/transactions/\(queryString)", method: .GET)
		let response = try await client.execute(request, timeout: .seconds(30))

		guard response.status.code == 200 else {
			if response.status.code == 401 {
				throw GoCardlessError.unauthorized
			} else if response.status.code == 404 {
				throw GoCardlessError.apiError("Account with ID \(id) not found")
			} else {
				let responseBuffer = try await response.body.collect(
					upTo: 1024 * 1024)  // 1MB limit
				let responseBody = String(buffer: responseBuffer)
				throw GoCardlessError.apiError(
					"HTTP \(response.status.code): \(responseBody)")
			}
		}

		let buffer = try await response.body.collect(upTo: 1024 * 1024)  // 1MB limit

		let decoder = JSONDecoder()
		let transactions = try decoder.decode(
			GoCardlessTransactionsResponse.self, from: Data(buffer.readableBytesView))

		return transactions
	}

	// MARK: - Private Helper Methods

	private func createRequest(path: String, method: HTTPMethod, body: Data? = nil) async throws
		-> HTTPClientRequest
	{
		var request = HTTPClientRequest(url: "\(baseUrl)\(path)")
		request.method = method

		// Add authorization header
		if let accessToken = self.accessToken {
			request.headers.add(name: "Authorization", value: "Bearer \(accessToken)")
		}

		// Add content type header for POST/PUT requests
		if body != nil {
			request.headers.add(name: "Content-Type", value: "application/json")
		}

		if let body = body {
			request.body = .bytes(ByteBuffer(data: body))
		}

		return request
	}
}
