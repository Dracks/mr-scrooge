import Fluent
import Foundation
import OpenAPIClient
import Vapor
import VaporElementary

struct AccountListResponse: Content {
	var accounts: [Account]
}

struct GocardlessAccountsController: RouteCollection {
    static let path: PathComponent = "gcl-accounts";

	func boot(routes: RoutesBuilder) throws {
		routes.grouped(GocardlessAccountsController.path).get(use: listAccounts)
	}

	func listAccounts(req: Request) async throws -> AccountListResponse {
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		guard let credentials = try await GocardlessInstitutionCredentials.query(on: req.db)
			.filter(\.$user.$id == userId)
			.first() else {
			throw Abort(.notFound, reason: "No credentials configured")
		}

		actor GocardlessServiceActor {
			private var credentials: GocardlessInstitutionCredentials
			private let db: Database

			init(credentials: GocardlessInstitutionCredentials, db: Database) {
				self.credentials = credentials
				self.db = db
			}

			private func refreshAccessTokenIfNeeded() async throws {
				guard credentials.isTokenExpired else { return }
				guard let refreshToken = credentials.refreshToken else {
					throw Abort(.unauthorized, reason: "No refresh token available")
				}

				let response = try await GocardlessService.refreshToken(refreshToken: refreshToken)
				credentials.setTokens(
					access: response.access ?? "",
					refresh: refreshToken,
					expiresIn: response.accessExpires ?? 86400
				)
				try await credentials.update(on: db)
			}

			func listAccounts() async throws -> [Account] {
				try await refreshAccessTokenIfNeeded()

				guard let accessToken = credentials.accessToken else {
					throw Abort(.unauthorized, reason: "No access token available")
				}

				return try await GocardlessService.listAccounts(accessToken: accessToken)
			}
		}

		let actor = GocardlessServiceActor(credentials: credentials, db: req.db)
		let accounts = try await actor.listAccounts()
		return AccountListResponse(accounts: accounts)
	}
}