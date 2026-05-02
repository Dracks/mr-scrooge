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
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}

		let formData = try req.content.decode(GocardlessCredentialsForm.self)
		let userId = try user.requireID()

		let credentials =
			try await GocardlessInstitutionCredentials.query(on: req.db)
			.filter(\.$user.$id == userId)
			.first()
			?? GocardlessInstitutionCredentials(
				userId: userId,
				secretId: formData.secretId,
				secretKey: formData.secretKey
			)

		credentials.secretId = formData.secretId
		credentials.secretKey = formData.secretKey

		let jWTObtainPairRequest = JWTObtainPairRequest(
			secretId: credentials.secretId, secretKey: credentials.secretKey)  // JWTObtainPairRequest |

		let tokenResponse = try await TokenAPI.obtainNewAccessRefreshTokenPair(
			jWTObtainPairRequest: jWTObtainPairRequest)

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
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}

		let credentials = try await user.$gclCredentials.load(on: req.db)

		let hasCredentials = credentials != nil

		return HTMLResponse {
			GocardlessCredentialsPage(hasCredentials: hasCredentials)
		}
	}
}
