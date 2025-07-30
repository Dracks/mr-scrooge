import ConsoleKit
import Foundation

// MARK: - Data Models

struct AccessTokenResponse: Codable {
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

struct Institution: Codable {
	let id: String
	let name: String
	let bic: String
	let transactionTotalDays: String
	let countries: [String]
	let logo: String
	let maxAccessValidForDays: String?

	enum CodingKeys: String, CodingKey {
		case id, name, bic, countries, logo
		case transactionTotalDays = "transaction_total_days"
		case maxAccessValidForDays = "max_access_valid_for_days"
	}
}

struct EndUserAgreement: Codable {
	let id: String
	let created: String
	let maxHistoricalDays: Int
	let accessValidForDays: Int
	let accessScope: [String]
	let accepted: String
	let institutionId: String

	enum CodingKeys: String, CodingKey {
		case id, created, accepted
		case maxHistoricalDays = "max_historical_days"
		case accessValidForDays = "access_valid_for_days"
		case accessScope = "access_scope"
		case institutionId = "institution_id"
	}
}

struct RequisitionStatus: Codable {
	let short: String
	let long: String
	let description: String
}

struct Requisition: Codable {
	let id: String
	let redirect: String
	let status: RequisitionStatus
	let agreement: String?
	let accounts: [String]
	let reference: String?
	let userLanguage: String?
	let link: String

	enum CodingKeys: String, CodingKey {
		case id, redirect, status, agreement, accounts, reference, link
		case userLanguage = "user_language"
	}
}

struct TransactionAmount: Codable {
	let currency: String
	let amount: String
}

struct DebtorAccount: Codable {
	let iban: String?
}

struct Transaction: Codable {
	let transactionId: String?
	let debtorName: String?
	let creditorName: String?
	let debtorAccount: DebtorAccount?
	let transactionAmount: TransactionAmount
	let bookingDate: String?
	let valueDate: String?
	let remittanceInformationUnstructured: String?
	let bankTransactionCode: String?

	enum CodingKeys: String, CodingKey {
		case transactionId, debtorName, creditorName, debtorAccount
		case transactionAmount, bookingDate, valueDate
		case remittanceInformationUnstructured, bankTransactionCode
	}
}

struct TransactionsResponse: Codable {
	let transactions: TransactionData
}

struct TransactionData: Codable {
	let booked: [Transaction]
	let pending: [Transaction]
}

struct AccountDetails: Codable {
	let resourceId: String?
	let iban: String?
	let currency: String?
	let ownerName: String?
	let name: String?
	let product: String?
	let cashAccountType: String?

	enum CodingKeys: String, CodingKey {
		case resourceId, iban, currency, ownerName, name, product, cashAccountType
	}
}

struct BalanceAmount: Codable {
	let amount: String
	let currency: String
}

struct Balance: Codable {
	let balanceAmount: BalanceAmount
	let balanceType: String
	let referenceDate: String?

	enum CodingKeys: String, CodingKey {
		case balanceAmount, balanceType, referenceDate
	}
}

struct BalancesResponse: Codable {
	let balances: [Balance]
}

// MARK: - API Client

class GoCardlessClient {
	private let baseURL = "https://bankaccountdata.gocardless.com/api/v2"
	private var accessToken: String?

	func authenticate(secretId: String, secretKey: String) async throws -> AccessTokenResponse {
		let url = URL(string: "\(baseURL)/token/new/")!
		var request = URLRequest(url: url)
		request.httpMethod = "POST"
		request.setValue("application/json", forHTTPHeaderField: "Content-Type")
		request.setValue("application/json", forHTTPHeaderField: "accept")

		let body = ["secret_id": secretId, "secret_key": secretKey]
		request.httpBody = try JSONSerialization.data(withJSONObject: body)

		let (data, response) = try await URLSession.shared.data(for: request)

		guard let httpResponse = response as? HTTPURLResponse,
			httpResponse.statusCode == 200
		else {
			throw APIError.authenticationFailed
		}

		let tokenResponse = try JSONDecoder().decode(AccessTokenResponse.self, from: data)
		self.accessToken = tokenResponse.access
		return tokenResponse
	}

	func getInstitutions(country: String) async throws -> [Institution] {
		guard let token = accessToken else {
			throw APIError.notAuthenticated
		}

		let url = URL(string: "\(baseURL)/institutions/?country=\(country)")!
		var request = URLRequest(url: url)
		request.setValue("application/json", forHTTPHeaderField: "accept")
		request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

		let (data, _) = try await URLSession.shared.data(for: request)
		return try JSONDecoder().decode([Institution].self, from: data)
	}

	func createEndUserAgreement(
		institutionId: String, maxHistoricalDays: Int = 90, accessValidForDays: Int = 90,
		accessScope: [String] = ["balances", "details", "transactions"]
	) async throws -> EndUserAgreement {
		guard let token = accessToken else {
			throw APIError.notAuthenticated
		}

		let url = URL(string: "\(baseURL)/agreements/enduser/")!
		var request = URLRequest(url: url)
		request.httpMethod = "POST"
		request.setValue("application/json", forHTTPHeaderField: "Content-Type")
		request.setValue("application/json", forHTTPHeaderField: "accept")
		request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

		let body: [String: Any] = [
			"institution_id": institutionId,
			"max_historical_days": maxHistoricalDays,
			"access_valid_for_days": accessValidForDays,
			"access_scope": accessScope,
		]
		request.httpBody = try JSONSerialization.data(withJSONObject: body)

		let (data, _) = try await URLSession.shared.data(for: request)
		return try JSONDecoder().decode(EndUserAgreement.self, from: data)
	}

	func createRequisition(
		institutionId: String, redirect: String, reference: String? = nil,
		agreementId: String? = nil, userLanguage: String = "EN"
	) async throws -> Requisition {
		guard let token = accessToken else {
			throw APIError.notAuthenticated
		}

		let url = URL(string: "\(baseURL)/requisitions/")!
		var request = URLRequest(url: url)
		request.httpMethod = "POST"
		request.setValue("application/json", forHTTPHeaderField: "Content-Type")
		request.setValue("application/json", forHTTPHeaderField: "accept")
		request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

		var body: [String: Any] = [
			"redirect": redirect,
			"institution_id": institutionId,
			"user_language": userLanguage,
		]

		if let reference = reference {
			body["reference"] = reference
		}

		if let agreementId = agreementId {
			body["agreement"] = agreementId
		}

		request.httpBody = try JSONSerialization.data(withJSONObject: body)

		let (data, _) = try await URLSession.shared.data(for: request)
		return try JSONDecoder().decode(Requisition.self, from: data)
	}

	func getRequisition(id: String) async throws -> Requisition {
		guard let token = accessToken else {
			throw APIError.notAuthenticated
		}

		let url = URL(string: "\(baseURL)/requisitions/\(id)/")!
		var request = URLRequest(url: url)
		request.setValue("application/json", forHTTPHeaderField: "accept")
		request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

		let (data, _) = try await URLSession.shared.data(for: request)
		return try JSONDecoder().decode(Requisition.self, from: data)
	}

	func getAccountDetails(accountId: String) async throws -> AccountDetails {
		guard let token = accessToken else {
			throw APIError.notAuthenticated
		}

		let url = URL(string: "\(baseURL)/accounts/\(accountId)/details/")!
		var request = URLRequest(url: url)
		request.setValue("application/json", forHTTPHeaderField: "accept")
		request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

		let (data, _) = try await URLSession.shared.data(for: request)
		return try JSONDecoder().decode(AccountDetails.self, from: data)
	}

	func getAccountBalances(accountId: String) async throws -> BalancesResponse {
		guard let token = accessToken else {
			throw APIError.notAuthenticated
		}

		let url = URL(string: "\(baseURL)/accounts/\(accountId)/balances/")!
		var request = URLRequest(url: url)
		request.setValue("application/json", forHTTPHeaderField: "accept")
		request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

		let (data, _) = try await URLSession.shared.data(for: request)
		return try JSONDecoder().decode(BalancesResponse.self, from: data)
	}

	func getAccountTransactions(accountId: String) async throws -> TransactionsResponse {
		guard let token = accessToken else {
			throw APIError.notAuthenticated
		}

		let url = URL(string: "\(baseURL)/accounts/\(accountId)/transactions/")!
		var request = URLRequest(url: url)
		request.setValue("application/json", forHTTPHeaderField: "accept")
		request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

		let (data, _) = try await URLSession.shared.data(for: request)
		return try JSONDecoder().decode(TransactionsResponse.self, from: data)
	}
}

// MARK: - Errors

enum APIError: Error, LocalizedError {
	case notAuthenticated
	case authenticationFailed
	case invalidResponse
	case networkError(Error)

	var errorDescription: String? {
		switch self {
		case .notAuthenticated:
			return "Not authenticated. Please authenticate first."
		case .authenticationFailed:
			return "Authentication failed. Please check your credentials."
		case .invalidResponse:
			return "Invalid response from server."
		case .networkError(let error):
			return "Network error: \(error.localizedDescription)"
		}
	}
}

// MARK: - CLI Commands

@main
struct GoCardlessCLI: AsyncParsableCommand {
	static let configuration = CommandConfiguration(
		commandName: "gocardless-cli",
		abstract: "A Swift CLI for GoCardless Bank Account Data API",
		subcommands: [
			ListBanks.self, CreateRequisition.self, GetAccounts.self, DownloadData.self,
		],
		defaultSubcommand: ListBanks.self
	)
}

struct ListBanks: AsyncParsableCommand {
	static let configuration = CommandConfiguration(
		abstract: "List available banks for a country")

	@Option(name: .shortAndLong, help: "Your GoCardless secret ID")
	var secretId: String

	@Option(name: .shortAndLong, help: "Your GoCardless secret key")
	var secretKey: String

	@Option(name: .shortAndLong, help: "Country code (e.g., 'gb', 'de', 'fr')")
	var country: String = "gb"

	func run() async throws {
		let client = GoCardlessClient()

		print("🔑 Authenticating...")
		do {
			let tokenResponse = try await client.authenticate(
				secretId: secretId, secretKey: secretKey)
			print("✅ Authenticated successfully")
			print("   Access token expires in: \(tokenResponse.accessExpires) seconds")
		} catch {
			print("❌ Authentication failed: \(error.localizedDescription)")
			return
		}

		print("\n🏦 Fetching banks for country: \(country.uppercased())")
		do {
			let institutions = try await client.getInstitutions(country: country)
			print("✅ Found \(institutions.count) banks")

			print("\nAvailable Banks:")
			print("================")
			for institution in institutions.sorted(by: { $0.name < $1.name }) {
				print("🏦 \(institution.name)")
				print("   ID: \(institution.id)")
				print("   BIC: \(institution.bic)")
				print(
					"   Transaction History: \(institution.transactionTotalDays) days"
				)
				if let maxAccess = institution.maxAccessValidForDays {
					print("   Max Access: \(maxAccess) days")
				}
				print("   Logo: \(institution.logo)")
				print("")
			}
		} catch {
			print("❌ Failed to fetch banks: \(error.localizedDescription)")
		}
	}
}

struct CreateRequisition: AsyncParsableCommand {
	static let configuration = CommandConfiguration(
		abstract: "Create a requisition for bank account access")

	@Option(name: .shortAndLong, help: "Your GoCardless secret ID")
	var secretId: String

	@Option(name: .shortAndLong, help: "Your GoCardless secret key")
	var secretKey: String

	@Option(name: .shortAndLong, help: "Institution ID (bank)")
	var institutionId: String

	@Option(name: .shortAndLong, help: "Redirect URL after authentication")
	var redirect: String = "https://example.com/callback"

	@Option(name: .shortAndLong, help: "Reference ID for internal tracking")
	var reference: String?

	@Option(help: "Maximum historical days for transactions")
	var maxHistoricalDays: Int = 90

	@Option(help: "Access valid for days")
	var accessValidForDays: Int = 90

	func run() async throws {
		let client = GoCardlessClient()

		print("🔑 Authenticating...")
		do {
			_ = try await client.authenticate(secretId: secretId, secretKey: secretKey)
			print("✅ Authenticated successfully")
		} catch {
			print("❌ Authentication failed: \(error.localizedDescription)")
			return
		}

		print("\n📋 Creating end user agreement...")
		do {
			let agreement = try await client.createEndUserAgreement(
				institutionId: institutionId,
				maxHistoricalDays: maxHistoricalDays,
				accessValidForDays: accessValidForDays
			)
			print("✅ Agreement created: \(agreement.id)")

			print("\n🔗 Creating requisition...")
			let requisition = try await client.createRequisition(
				institutionId: institutionId,
				redirect: redirect,
				reference: reference,
				agreementId: agreement.id
			)

			print("✅ Requisition created successfully!")
			print("\nRequisition Details:")
			print("===================")
			print("ID: \(requisition.id)")
			print(
				"Status: \(requisition.status.long) - \(requisition.status.description)"
			)
			print("Reference: \(requisition.reference ?? "N/A")")
			print("Redirect URL: \(requisition.redirect)")
			print("\n🌐 Authorization Link:")
			print("======================")
			print(requisition.link)
			print("\n📝 Instructions:")
			print("1. Open the authorization link above in your browser")
			print("2. Complete the bank authentication process")
			print("3. After completion, use the requisition ID to get accounts:")
			print(
				"   gocardless-cli get-accounts --secret-id=\(secretId) --secret-key=\(secretKey) --requisition-id=\(requisition.id)"
			)

		} catch {
			print("❌ Failed to create requisition: \(error.localizedDescription)")
		}
	}
}

struct GetAccounts: AsyncParsableCommand {
	static let configuration = CommandConfiguration(abstract: "Get accounts from a requisition")

	@Option(name: .shortAndLong, help: "Your GoCardless secret ID")
	var secretId: String

	@Option(name: .shortAndLong, help: "Your GoCardless secret key")
	var secretKey: String

	@Option(name: .shortAndLong, help: "Requisition ID")
	var requisitionId: String

	func run() async throws {
		let client = GoCardlessClient()

		print("🔑 Authenticating...")
		do {
			_ = try await client.authenticate(secretId: secretId, secretKey: secretKey)
			print("✅ Authenticated successfully")
		} catch {
			print("❌ Authentication failed: \(error.localizedDescription)")
			return
		}

		print("\n📋 Fetching requisition details...")
		do {
			let requisition = try await client.getRequisition(id: requisitionId)
			print("✅ Requisition status: \(requisition.status.long)")

			if requisition.accounts.isEmpty {
				print(
					"⚠️  No accounts found. Make sure you've completed the authorization process."
				)
				return
			}

			print("\n🏦 Found \(requisition.accounts.count) accounts:")
			print("Account IDs:")
			for (index, accountId) in requisition.accounts.enumerated() {
				print("\(index + 1). \(accountId)")
			}

			print("\n💡 To download data for these accounts, use:")
			print(
				"gocardless-cli download-data --secret-id=\(secretId) --secret-key=\(secretKey) --account-id=<ACCOUNT_ID>"
			)

		} catch {
			print("❌ Failed to fetch requisition: \(error.localizedDescription)")
		}
	}
}

struct DownloadData: AsyncParsableCommand {
	static let configuration = CommandConfiguration(
		abstract: "Download account data (details, balances, transactions)")

	@Option(name: .shortAndLong, help: "Your GoCardless secret ID")
	var secretId: String

	@Option(name: .shortAndLong, help: "Your GoCardless secret key")
	var secretKey: String

	@Option(name: .shortAndLong, help: "Account ID")
	var accountId: String

	@Option(name: .shortAndLong, help: "Output file path (optional)")
	var output: String?

	@Flag(help: "Include account details")
	var includeDetails: Bool = false

	@Flag(help: "Include account balances")
	var includeBalances: Bool = false

	@Flag(help: "Include account transactions")
	var includeTransactions: Bool = false

	func run() async throws {
		let client = GoCardlessClient()

		// If no specific data type is requested, include all
		let shouldIncludeAll = !includeDetails && !includeBalances && !includeTransactions
		let fetchDetails = includeDetails || shouldIncludeAll
		let fetchBalances = includeBalances || shouldIncludeAll
		let fetchTransactions = includeTransactions || shouldIncludeAll

		print("🔑 Authenticating...")
		do {
			_ = try await client.authenticate(secretId: secretId, secretKey: secretKey)
			print("✅ Authenticated successfully")
		} catch {
			print("❌ Authentication failed: \(error.localizedDescription)")
			return
		}

		var accountData: [String: Any] = [:]
		accountData["account_id"] = accountId
		accountData["downloaded_at"] = ISO8601DateFormatter().string(from: Date())

		if fetchDetails {
			print("\n📋 Fetching account details...")
			do {
				let details = try await client.getAccountDetails(
					accountId: accountId)
				accountData["details"] = details
				print("✅ Account details retrieved")
			} catch {
				print(
					"❌ Failed to fetch account details: \(error.localizedDescription)"
				)
			}
		}

		if fetchBalances {
			print("\n💰 Fetching account balances...")
			do {
				let balances = try await client.getAccountBalances(
					accountId: accountId)
				accountData["balances"] = balances.balances
				print(
					"✅ Account balances retrieved (\(balances.balances.count) balance(s))"
				)
			} catch {
				print(
					"❌ Failed to fetch account balances: \(error.localizedDescription)"
				)
			}
		}

		if fetchTransactions {
			print("\n💳 Fetching account transactions...")
			do {
				let transactions = try await client.getAccountTransactions(
					accountId: accountId)
				accountData["transactions"] = [
					"booked": transactions.transactions.booked,
					"pending": transactions.transactions.pending,
				]
				print("✅ Account transactions retrieved")
				print(
					"   Booked: \(transactions.transactions.booked.count) transactions"
				)
				print(
					"   Pending: \(transactions.transactions.pending.count) transactions"
				)
			} catch {
				print(
					"❌ Failed to fetch account transactions: \(error.localizedDescription)"
				)
			}
		}

		// Save to file
		do {
			let jsonData = try JSONSerialization.data(
				withJSONObject: accountData, options: .prettyPrinted)

			let fileName =
				output
				?? "account_data_\(accountId)_\(Int(Date().timeIntervalSince1970)).json"
			let fileURL = URL(fileURLWithPath: fileName)

			try jsonData.write(to: fileURL)
			print("\n💾 Data saved to: \(fileName)")
			print(
				"📊 File size: \(ByteCountFormatter.string(fromByteCount: Int64(jsonData.count), countStyle: .file))"
			)

		} catch {
			print("❌ Failed to save data: \(error.localizedDescription)")
		}
	}
}
