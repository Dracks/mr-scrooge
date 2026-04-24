import AsyncHTTPClient
import Fluent
import Foundation
import OpenAPIClient
import Vapor
import VaporElementary

struct AccountListResponse: Content {
	var accounts: [Account]
}

struct CreateAgreementRequest: Content {
	var institutionId: String
}

struct GocardlessAccountsController: RouteCollection {
    static let path: PathComponent = "gcl-accounts";

	func boot(routes: RoutesBuilder) throws {
		let accountsGroup = routes.grouped(GocardlessAccountsController.path)
		accountsGroup.get(use: showAccounts)
		accountsGroup.post("create", use: createAgreement)
		accountsGroup.get(use: listAccounts)
	}

	func showAccounts(req: Request) async throws -> HTMLResponse {
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		guard let credentials = try await GocardlessInstitutionCredentials.query(on: req.db)
			.filter(\.$user.$id == userId)
			.first() else {
			throw Abort(.notFound, reason: "No credentials configured")
		}

		let agreements = try await UserAgreement.query(on: req.db)
			.filter(\.$user.$id == userId)
			.all()

		let country = "ES"
		let httpClient = HTTPClient(eventLoopGroupProvider: .shared(req.eventLoop))

		let gclService = GoCardlessService(
			client: httpClient,
			secretId: credentials.secretId,
			secretKey: credentials.secretKey
		)

		try await gclService.obtainTokens()
		let institutions = try await gclService.getInstitutions(country: country)

		let institutionViews = institutions.map { institution in
			InstitutionView(
				id: institution.id,
				name: institution.name
			)
		}

		return HTMLResponse {
			GocardlessAccountsPage(
				username: user.username,
				agreements: agreements,
				institutions: institutionViews,
				country: country
			)
		}
	}

	func createAgreement(req: Request) async throws -> HTMLResponse {
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		guard let credentials = try await GocardlessInstitutionCredentials.query(on: req.db)
			.filter(\.$user.$id == userId)
			.first() else {
			throw Abort(.notFound, reason: "No credentials configured")
		}

		let formData = try req.content.decode(CreateAgreementRequest.self)
		let institutionId = formData.institutionId

		guard !institutionId.isEmpty else {
			throw Abort(.badRequest, reason: "Please select a bank")
		}

		let httpClient = HTTPClient(eventLoopGroupProvider: .shared(req.eventLoop))

		let gclService = GoCardlessService(
			client: httpClient,
			secretId: credentials.secretId,
			secretKey: credentials.secretKey
		)

		try await gclService.obtainTokens()

		let institution = try await gclService.getInstitution(id: institutionId)

		let agreement = try await gclService.createEndUserAgreement(institutionId: institutionId)

		let redirectUrl = "\(EnvConfig.shared.baseHost)/gcl-accounts/created"

		let requisition = try await gclService.createRequisition(
			institutionId: institutionId,
			redirectUrl: redirectUrl,
			agreementId: agreement.id
		)

		let userAgreement = UserAgreement(
			userId: userId,
			agreementId: agreement.id,
			institutionId: institutionId,
			institutionName: institution.name,
			status: "pending"
		)
		try await userAgreement.save(on: req.db)

		guard let link = requisition.link else {
			throw Abort(.internalServerError, reason: "No redirect link returned")
		}

		return HTMLResponse {
			GocardlessAccountsCreatedPage(
				username: user.username,
				institutionName: institution.name,
				redirectUrl: link
			)
		}
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