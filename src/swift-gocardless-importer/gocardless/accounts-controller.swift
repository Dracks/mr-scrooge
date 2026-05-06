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
		accountsGroup.post("create", use: createAgreement)
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

		let apiConfig = try await credentials.apiConfig(client: req.client, on: req.db)
		let institution = try await InstitutionsAPI.retrieveInstitution(
			id: institutionId, apiConfiguration: apiConfig
		).get().getOrThrow()

		let agreement = try await AgreementsAPI.createEUA(
			endUserAgreementRequest: .init(institutionId: institutionId),
			apiConfiguration: apiConfig
		).get().getOrThrow()

		guard let agreementId = agreement.id else {
			throw Exception(ErrorCodes.E10008)
		}

		let redirectUrl = "\(EnvConfig.shared.baseHost)/institutions/created"

		let requisition = try await RequisitionsAPI.createRequisition(
			requisitionRequest: .init(
				redirect: redirectUrl, institutionId: institutionId),
			apiConfiguration: apiConfig
		).get().getOrThrow()

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
