import Fluent
import Foundation
import GoCardlessClient
import Vapor
import VaporElementary

struct GocardlessCredentialsForm: Content {
	var secretId: String
	var secretKey: String
}

struct GocardlessKeysController: RouteCollection {
	static let path: PathComponent = "gcl-keys"

	func boot(routes: RoutesBuilder) throws {
		let keys = routes.grouped(GocardlessKeysController.path)
		keys.get(use: showCredentials)
		keys.post(use: setCredentials)
	}

	func setCredentials(req: Request) async throws -> HTMLResponse {
		guard let user = try await getUser(fromRequest: req) else {
			throw Abort(.unauthorized)
		}

		let formData = try req.content.decode(GocardlessCredentialsForm.self)
		let userId = try user.requireID()

		let credentials =
			user.gclCredentials
			?? GocardlessCredentials(
				userId: userId,
				secretId: formData.secretId,
				secretKey: formData.secretKey
			)

		credentials.secretId = formData.secretId
		credentials.secretKey = formData.secretKey

		let jWTObtainPairRequest = JWTObtainPairRequest(
			secretId: credentials.secretId, secretKey: credentials.secretKey)  // JWTObtainPairRequest |

		let tokenResponse = try await TokenAPI.obtainNewAccessRefreshTokenPair(
			jWTObtainPairRequest: jWTObtainPairRequest
		).get().getOrThrow()

		credentials.setTokens(
			access: tokenResponse.access ?? "",
			refresh: tokenResponse.refresh ?? "",
			expiresIn: tokenResponse.accessExpires ?? 86400
		)

		try await credentials.save(on: req.db)

		return HTMLResponse {
			GocardlessCredentialsPage(hasCredentials: true)
		}
	}

	func showCredentials(req: Request) async throws -> HTMLResponse {
		guard let user = try await getUser(fromRequest: req) else {
			throw Abort(.unauthorized)
		}

		let hasCredentials = user.gclCredentials != nil

		return HTMLResponse {
			GocardlessCredentialsPage(hasCredentials: hasCredentials)
		}
	}
}
