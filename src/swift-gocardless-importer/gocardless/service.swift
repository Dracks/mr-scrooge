import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
import OpenAPIClient
import Vapor

final class JWTAuthInterceptor: OpenAPIInterceptor {
	let accessToken: String

	init(accessToken: String) {
		self.accessToken = accessToken
	}

	public func intercept<T>(
		urlRequest: URLRequest, urlSession: URLSessionProtocol,
		requestBuilder: RequestBuilder<T>,
		completion: @Sendable @escaping (Result<URLRequest, any Error>) -> Void
	) {
		var request = urlRequest
		request.setValue("Bearer \(self.accessToken)", forHTTPHeaderField: "Authorization")
		let result: Result<URLRequest, any Error> = .success(request)
		completion(result)
	}

	public func retry<T>(
		urlRequest: URLRequest, urlSession: URLSessionProtocol,
		requestBuilder: RequestBuilder<T>, data: Data?, response: URLResponse?,
		error: Error, completion: @escaping @Sendable (OpenAPIInterceptorRetry) -> Void
	) {
		completion(.dontRetry)
	}

	public func willSendRequest<T>(
		urlRequest: URLRequest, urlSession: URLSessionProtocol,
		requestBuilder: RequestBuilder<T>
	) {}

	public func didReceiveResponse<T>(
		urlRequest: URLRequest, urlSession: URLSessionProtocol,
		requestBuilder: RequestBuilder<T>, data: Data?, response: URLResponse?,
		error: Error?
	) {}

	public func didComplete<T>(
		urlRequest: URLRequest, urlSession: URLSessionProtocol,
		requestBuilder: RequestBuilder<T>, data: Data?, response: URLResponse?,
		result: Result<T, Error>
	) {}
}

struct GocardlessService {
	static let baseURL = "https://bankaccountdata.gocardless.com"

	static func createConfiguration(accessToken: String? = nil) -> OpenAPIClientAPIConfiguration {
		let config = OpenAPIClientAPIConfiguration()
		config.basePath = baseURL
		if let token = accessToken {
			let interceptor = JWTAuthInterceptor(accessToken: token)
			config.interceptor = interceptor
		}
		return config
	}

	static func obtainTokenPair(
		secretId: String, secretKey: String
	) async throws -> SpectacularJWTObtain {
		let config = createConfiguration()
		let request = JWTObtainPairRequest(secretId: secretId, secretKey: secretKey)
		return try await TokenAPI.obtainNewAccessRefreshTokenPair(
			jWTObtainPairRequest: request, apiConfiguration: config
		)
	}

	static func refreshToken(
		refreshToken: String
	) async throws -> SpectacularJWTRefresh {
		let config = createConfiguration()
		let request = JWTRefreshRequest(refresh: refreshToken)
		return try await TokenAPI.getANewAccessToken(
			jWTRefreshRequest: request, apiConfiguration: config
		)
	}

	static func listAccounts(
		accessToken: String
	) async throws -> [Account] {
		let config = createConfiguration(accessToken: accessToken)
		let requisitions = try await RequisitionsAPI.retrieveAllRequisitions(
			apiConfiguration: config
		)

		var allAccounts: [Account] = []
		for req in requisitions.results {
			guard let accounts = req.accounts, !accounts.isEmpty else { continue }
			for accountId in accounts {
				let account = try await AccountsAPI.retrieveAccountMetadata(
					id: accountId.uuidString, apiConfiguration: config
				)
				allAccounts.append(account)
			}
		}

		return allAccounts
	}
}