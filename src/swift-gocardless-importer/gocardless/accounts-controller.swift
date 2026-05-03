import AsyncHTTPClient
import Exceptions
import Fluent
import Foundation
import GoCardlessClient
import Vapor
import VaporElementary

struct CreateAgreementRequest: Content {
	var institutionId: String
}

struct GocardlessAccountsController: RouteCollection {
	static let path: PathComponent = "gcl-accounts"

	func boot(routes: RoutesBuilder) throws {
		let accountsGroup = routes.grouped(GocardlessAccountsController.path)
		accountsGroup.get(use: showAccounts)
		accountsGroup.get("add", use: showCountrySelection)
		accountsGroup.get("add", "institutions", use: showInstitutionsForCountry)
		accountsGroup.post("create", use: createAgreement)
		try accountsGroup.register(collection: UserAgreementsController())
	}

	func showAccounts(req: Request) async throws -> HTMLResponse {
		guard let user = try await getUser(fromRequest: req) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		let agreements = try await UserAgreement.query(on: req.db)
			.filter(\.$user.$id == userId).with(\.$bankAccounts)
			.all()

		var accountDetails: [AccountDetailView] = []
		if !agreements.isEmpty {

			for agreement in agreements {
				for account in agreement.bankAccounts {
					accountDetails.append(
						AccountDetailView(
							agreementId: agreement.id?
								.uuidString ?? "",
							institutionName: agreement
								.institutionName,
							iban: account.iban,
							ownerName: account.ownerName,
							status: account.status,
							name: account.name
						))
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

		guard let credentials = try await user.$gclCredentials.get(on: req.db) else {
			throw Abort(.notFound, reason: "No credentials configured")
		}

		guard let country = req.query[String.self, at: "country"] else {
			throw Abort(.badRequest, reason: "Country parameter required")
		}

		let institutions =
			try await InstitutionsAPI.retrieveAllSupportedInstitutionsInAGivenCountry(
				country: country, apiConfiguration: credentials.apiConfig())

		let institutionViews = institutions.map { institution in
			InstitutionView(
				id: institution.id,
				name: institution.name,
				bic: institution.bic ?? "",
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

		guard let credentials = try await user.$gclCredentials.get(on: req.db) else {
			throw Abort(.notFound, reason: "No credentials configured")
		}

		let formData = try req.content.decode(CreateAgreementRequest.self)
		let institutionId = formData.institutionId

		guard !institutionId.isEmpty else {
			throw Abort(.badRequest, reason: "Please select a bank")
		}

		/* let gclService = GoCardlessService(
			client: req.application.gocardlessHTTPClient,
			secretId: credentials.secretId,
			secretKey: credentials.secretKey
		)

		try await gclService.obtainTokens()

		let institution = try await gclService.getInstitution(id: institutionId)

		let agreement = try await gclService.createEndUserAgreement(institutionId: institutionId) */

		let apiConfig = credentials.apiConfig()
		let institution = try await InstitutionsAPI.retrieveInstitution(
			id: institutionId, apiConfiguration: apiConfig)

		let agreement = try await AgreementsAPI.createEUA(
			endUserAgreementRequest: .init(institutionId: institutionId),
			apiConfiguration: apiConfig)

		guard let agreementId = agreement.id else {
			throw Exception(ErrorCodes.E10008)
		}

		let redirectUrl = "\(EnvConfig.shared.baseHost)/gcl-accounts/agreements/created"

		let requisition = try await RequisitionsAPI.createRequisition(
			requisitionRequest: .init(
				redirect: redirectUrl, institutionId: institutionId),
			apiConfiguration: apiConfig)

		guard let requisitionId = requisition.id else {
			throw Exception(ErrorCodes.E10009)
		}

		let userAgreement = UserAgreement(
			userId: try user.requireID(),
			agreementId: agreementId,
			institutionId: institutionId,
			institutionName: institution.name,
			status: "pending",
			requisitionId: requisitionId
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
