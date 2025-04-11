import Testing
import VaporTesting

@testable import MrScroogeServer

class BaseWithFactories {
	let ruleFactory = RuleFactory()
	let conditionFactory = RuleConditionFactory()
	let transactionFactory = BankTransactionFactory()
	let labelFactory = LabelFactory()
}

extension TestingApplicationTester {
	public func sendRequest(
		_ method: HTTPMethod,
		_ path: String,
		body: any Codable,
		headers immutableHeaders: HTTPHeaders = [:],
		fileID: String = #fileID,
		filePath: String = #filePath,
		line: Int = #line,
		column: Int = #column,
		beforeRequest: (inout TestingHTTPRequest) async throws -> Void = { _ in }
	) async throws -> TestingHTTPResponse {
		var headers = immutableHeaders
		headers.add(name: "content-type", value: "application/json")
		return try await self.sendRequest(
			method, path, headers: headers,
			body: ByteBuffer(data: try JSONEncoder().encode(body)),
			fileID: fileID, filePath: filePath, line: line,
			column: column,
			beforeRequest: beforeRequest
		)
	}

	func headers(forUser credentials: Components.Schemas.UserCredentials) async throws
		-> HTTPHeaders
	{
		let response = try await sendRequest(.POST, "/api/session", body: credentials)
		assert(
			response.headers.contains(name: "set-cookie"),
			"Login request must return a set-cookie header")
		let cookiesList: [String] = response.headers["set-cookie"]
		let cookie: String = cookiesList[0]
		return ["cookie": cookie]
	}
}
