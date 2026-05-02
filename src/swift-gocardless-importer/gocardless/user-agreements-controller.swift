import Fluent
import Foundation
import GoCardlessClient
import Vapor
import VaporElementary

struct UserAgreementsController: RouteCollection {
	static let path: PathComponent = "agreements"

	func boot(routes: RoutesBuilder) throws {
		let agreementsGroup = routes.grouped(UserAgreementsController.path)
		agreementsGroup.get(use: listAgreements)
		agreementsGroup.get("created", use: handleCallback)
		agreementsGroup.get(":id", "add-accounts", use: showAvailableAccounts)
		agreementsGroup.post(":id", "add-accounts", use: selectAccounts)
		agreementsGroup.post(":id", "delete") { req -> Vapor.Response in
			try await self.deleteAgreement(req: req)
		}
	}

	func listAgreements(req: Request) async throws -> HTMLResponse {
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		let agreements = try await UserAgreement.query(on: req.db)
			.filter(\.$user.$id == userId)
			.sort(\.$createdAt, .descending)
			.all()

		let existingAccountIds = Set(
			try await GocardlessBankAccount.query(on: req.db)
				.filter(\.$user.$id == userId)
				.all()
				.map { $0.accountId }
		)

		return HTMLResponse {
			UserAgreementsListPage(
				username: user.username,
				agreements: agreements,
				existingAccountIds: existingAccountIds
			)
		}
	}

	func showAvailableAccounts(req: Request) async throws -> HTMLResponse {
		guard let user = try await getUser(fromRequest: req) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		guard let credentials = user.gclCredentials else {
			throw Abort(.notFound, reason: "No credentials configured")

		}

		guard let agreementIdString = req.parameters.get("id"),
			let agreementId = UUID(uuidString: agreementIdString)
		else {
			throw Abort(.badRequest, reason: "Invalid agreement ID")
		}

		let agreement = try await UserAgreement.query(on: req.db)
			.filter(\.$user.$id == userId)
			.filter(\.$id == agreementId)
			.first()

		guard let agreement = agreement else {
			throw Abort(.notFound, reason: "Agreement not found")
		}

		guard agreement.status == "approved" else {
			throw Abort(
				.badRequest,
				reason: "Agreement must be approved before adding accounts")
		}

		/* let gclService = GoCardlessService(
			client: req.application.gocardlessHTTPClient,
			secretId: credentials.secretId,
			secretKey: credentials.secretKey
		)

		try await gclService.obtainTokens()

		let requisition = try await gclService.getRequisitionsBy(requisitionId: agreement.requisitionId) */

		let apiConfig = credentials.apiConfig()

		let requisition = try await RequisitionsAPI.requisitionById(
			id: agreement.requisitionId, apiConfiguration: apiConfig)

		var accountViews: [AvailableAccountView] = []
		for accountId in requisition.accounts ?? [] {
			let accountResponse = try await AccountsAPI.retrieveAccountDetails(
				id: accountId.uuidString, apiConfiguration: apiConfig)
			let account = accountResponse.account
			// if let account = try? await gclService.getAccountDetails(id: accountId) {
			accountViews.append(
				AvailableAccountView(
					accountId: accountId.uuidString,
					iban: account.iban ?? "no-ivan",
					ownerName: account.ownerName,
					name: account.name,
					status: account.status ?? "no-status"
				))
			// }
		}

		let existingAccountIds = Set(
			try await GocardlessBankAccount.query(on: req.db)
				.filter(\.$user.$id == userId)
				.filter(\.$agreement.$id == agreementId)
				.all()
				.map { $0.accountId }
		)

		return HTMLResponse {
			SelectAccountsPage(
				username: user.username,
				agreement: agreement,
				accounts: accountViews,
				existingAccountIds: existingAccountIds
			)
		}
	}

	func selectAccounts(req: Request) async throws -> Vapor.Response {
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		guard let agreementIdString = req.parameters.get("id"),
			let agreementId = UUID(uuidString: agreementIdString)
		else {
			throw Abort(.badRequest, reason: "Invalid agreement ID")
		}

		let agreement = try await UserAgreement.query(on: req.db)
			.filter(\.$user.$id == userId)
			.filter(\.$id == agreementId)
			.first()

		guard let agreement = agreement else {
			throw Abort(.notFound, reason: "Agreement not found")
		}

		struct SelectAccountsRequest: Content {
			var accountIds: [String]
		}

		let body = try req.content.decode(SelectAccountsRequest.self)

		guard !body.accountIds.isEmpty else {
			throw Abort(.badRequest, reason: "No accounts selected")
		}

		guard
			let credentials = try await GocardlessInstitutionCredentials.query(
				on: req.db
			)
			.filter(\.$user.$id == userId)
			.first()
		else {
			throw Abort(.notFound, reason: "No credentials configured")
		}

		let gclService = GoCardlessService(
			client: req.application.gocardlessHTTPClient,
			secretId: credentials.secretId,
			secretKey: credentials.secretKey
		)

		try await gclService.obtainTokens()

		let existingAccountIds = Set(
			try await GocardlessBankAccount.query(on: req.db)
				.filter(\.$user.$id == userId)
				.filter(\.$agreement.$id == agreementId)
				.all()
				.map { $0.accountId }
		)

		for accountId in body.accountIds {
			guard !existingAccountIds.contains(accountId) else { continue }

			if let account = try? await gclService.getAccountDetails(id: accountId) {
				let bankAccount = GocardlessBankAccount(
					userId: userId,
					agreementId: try agreement.requireID(),
					accountId: account.id,
					institutionId: agreement.institutionId,
					institutionName: agreement.institutionName,
					iban: account.iban,
					ownerName: account.ownerName,
					status: account.status,
					name: account.name
				)
				try await bankAccount.save(on: req.db)
			}
		}

		return Vapor.Response(
			status: .seeOther,
			headers: [
				"Location":
					"/\(GocardlessAccountsController.path)/\(UserAgreementsController.path)"
			])
	}

	func handleCallback(req: Request) async throws -> HTMLResponse {
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		guard let ref = req.query[String.self, at: "ref"],
			let ref = UUID(uuidString: ref)
		else {
			throw Abort(.badRequest, reason: "Missing ref parameter")
		}

		let agreement = try await UserAgreement.query(on: req.db)
			.filter(\.$user.$id == userId)
			.filter(\.$requisitionId == ref)
			.first()

		guard let agreement else {
			req.logger.warning(
				"Agreement callback received for unknown ref: \(ref), user: \(userId)"
			)
			return HTMLResponse {
				GocardlessCallbackPage(
					username: user.username,
					ref: ref.uuidString,
					agreementFound: false,
					institutionName: nil
				)
			}
		}

		agreement.status = "approved"
		try await agreement.save(on: req.db)

		return HTMLResponse {
			GocardlessCallbackPage(
				username: user.username,
				ref: ref.uuidString,
				agreementFound: true,
				institutionName: agreement.institutionName
			)
		}
	}

	func deleteAgreement(req: Request) async throws -> Vapor.Response {
		guard let user = req.auth.get(GoCardlessImporter.User.self) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()

		guard let agreementId = req.parameters.get("id"),
			let uuid = UUID(uuidString: agreementId)
		else {
			throw Abort(.badRequest, reason: "Invalid agreement ID")
		}

		let agreement = try await UserAgreement.query(on: req.db)
			.filter(\.$user.$id == userId)
			.filter(\.$id == uuid)
			.first()

		guard let agreement = agreement else {
			throw Abort(.notFound, reason: "Agreement not found")
		}

		try await agreement.delete(on: req.db)

		return Vapor.Response(
			status: .seeOther,
			headers: [
				"Location":
					"/\(GocardlessAccountsController.path)/\(UserAgreementsController.path)"
			])
	}
}
