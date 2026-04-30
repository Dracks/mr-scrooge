import AsyncHTTPClient
import Fluent
import Foundation
import OpenAPIClient
import Vapor
import VaporElementary


struct CreateAgreementRequest: Content {
	var institutionId: String
}


struct GocardlessAccountsController: RouteCollection {
    static let path: PathComponent = "gcl-accounts";

	func boot(routes: RoutesBuilder) throws {
		let accountsGroup = routes.grouped(GocardlessAccountsController.path)
		accountsGroup.get(use: showAccounts)
		accountsGroup.get("add", use: showCountrySelection)
		accountsGroup.get("add", "institutions", use: showInstitutionsForCountry)
		accountsGroup.post("create", use: createAgreement)
		try accountsGroup.register(collection: UserAgreementsController())
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

		var accountDetails: [AccountDetailView] = []
		if !agreements.isEmpty {
			let gclService = GoCardlessService(
				client: req.application.gocardlessHTTPClient,
				secretId: credentials.secretId,
				secretKey: credentials.secretKey
			)

			try await gclService.obtainTokens()

			for agreement in agreements {
				let requisition = try await gclService.getRequisitionsBy(requisitionId: agreement.requisitionId)
					for accountId in requisition.accounts {
						if let account = try? await gclService.getAccountDetails(id: accountId) {
							accountDetails.append(AccountDetailView(
								agreementId: agreement.id?.uuidString ?? "",
								institutionName: agreement.institutionName,
								iban: account.iban,
								ownerName: account.ownerName,
								status: account.status,
								name: account.name
							))
						}
					}
			}
		}

		return HTMLResponse {
			GocardlessAccountsPage(
				username: user.username,
				accounts: accountDetails,
				agreements: agreements
			)
		}
	}

	func showCountrySelection(req: Request) async throws -> HTMLResponse {
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}

		return HTMLResponse {
			GocardlessCountrySelectionPage(
				username: user.username
			)
		}
	}

	func showInstitutionsForCountry(req: Request) async throws -> HTMLResponse {
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		guard let credentials = try await GocardlessInstitutionCredentials.query(on: req.db)
			.filter(\.$user.$id == userId)
			.first() else {
			throw Abort(.notFound, reason: "No credentials configured")
		}

		guard let country = req.query[String.self, at: "country"] else {
			throw Abort(.badRequest, reason: "Country parameter required")
		}

		let gclService = GoCardlessService(
			client: req.application.gocardlessHTTPClient,
			secretId: credentials.secretId,
			secretKey: credentials.secretKey
		)

		try await gclService.obtainTokens()
		let institutions = try await gclService.getInstitutions(country: country)

		let institutionViews = institutions.map { institution in
			InstitutionView(
				id: institution.id,
				name: institution.name,
				bic: institution.bic,
				countries: institution.countries
			)
		}

		return HTMLResponse {
			GocardlessInstitutionsPage(
				username: user.username,
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

		let gclService = GoCardlessService(
			client: req.application.gocardlessHTTPClient,
			secretId: credentials.secretId,
			secretKey: credentials.secretKey
		)

		try await gclService.obtainTokens()

		let institution = try await gclService.getInstitution(id: institutionId)

		let agreement = try await gclService.createEndUserAgreement(institutionId: institutionId)

		let redirectUrl = "\(EnvConfig.shared.baseHost)/gcl-accounts/agreements/created"

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
			status: "pending",
			requisitionId: requisition.id
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
}
