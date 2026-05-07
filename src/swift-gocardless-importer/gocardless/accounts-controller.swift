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
		accountsGroup.post(":agreementId", "download-transactions", use: downloadTransactions)
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
							accountId: account.accountId,
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

	func downloadTransactions(req: Request) async throws -> Response {
		guard let user = try await getUser(fromRequest: req) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		guard let agreementIdString = req.parameters.get("agreementId"),
			let agreementId = UUID(uuidString: agreementIdString)
		else {
			throw Abort(.badRequest, reason: "Invalid agreement ID")
		}

		let agreement = try await UserAgreement.query(on: req.db)
			.filter(\.$user.$id == userId)
			.filter(\.$id == agreementId)
			.with(\.$bankAccounts)
			.first()

		guard let agreement = agreement else {
			throw Abort(.notFound, reason: "Agreement not found")
		}

		guard let credentials = try await user.$gclCredentials.get(on: req.db) else {
			throw Abort(.notFound, reason: "No credentials configured")
		}

		guard let bankAccount = agreement.bankAccounts.first else {
			throw Abort(.notFound, reason: "No bank account found for this agreement")
		}

		let apiConfig = try await credentials.apiConfig(client: req.client, on: req.db)

		let transactions = try await AccountsAPI.retrieveAccountTransactions(
			id: bankAccount.accountId,
			apiConfiguration: apiConfig
		).get().getOrThrow()

		req.logger.info(
			"Fetched transactions for account \(bankAccount.accountId)",
			metadata: [
				"booked_count": "\(transactions.transactions.booked.count)",
				"pending_count": "\(transactions.transactions.pending?.count ?? 0)",
			]
		)

		for transaction in transactions.transactions.booked {
			req.logger.info(
				"BOOKED: \(transaction.bookingDate ?? "no-date") - \(transaction.transactionAmount.amount) \(transaction.transactionAmount.currency) - \(transaction.creditorName ?? transaction.debtorName ?? "no-name")",
				metadata: [
					"transactionId": "\(transaction.transactionId ?? "no-id")",
					"remittance": "\(transaction.remittanceInformationUnstructured ?? "")",
				]
			)
		}

		if let pending = transactions.transactions.pending {
			for transaction in pending {
				req.logger.info(
					"PENDING: \(transaction.valueDate ?? "no-date") - \(transaction.transactionAmount.amount) \(transaction.transactionAmount.currency) - \(transaction.creditorName ?? transaction.debtorName ?? "no-name")",
					metadata: [
						"remittance": "\(transaction.remittanceInformationUnstructured ?? "")",
					]
				)
			}
		}

		return req.redirect(to: "/\(GocardlessAccountsController.path)")
	}
}
