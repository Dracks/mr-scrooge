import Fluent
import Foundation
import GoCardlessClient
import Vapor
import VaporElementary

struct InstitutionsController: RouteCollection {
	static let path: PathComponent = "institutions"

	func boot(routes: RoutesBuilder) throws {
		let institutionsGroup = routes.grouped(InstitutionsController.path)
		institutionsGroup.get(use: listAgreements)
		institutionsGroup.get("add", use: showInstitutions)
		institutionsGroup.get("created", use: handleCallback)
		institutionsGroup.get(":id", "add-accounts", use: showAvailableAccounts)
		institutionsGroup.post(":id", "add-accounts", use: selectAccounts)
		institutionsGroup.post(":id", "delete") { req -> Vapor.Response in
			try await self.deleteAgreement(req: req)
		}
	}

	func showInstitutions(req: Request) async throws -> HTMLResponse {
		guard let user = try await getUser(fromRequest: req) else {
			throw Abort(.unauthorized)
		}

		let country = req.query[String.self, at: "country"]

		var institutionViews: [InstitutionView]? = nil
		if let country {

			guard let credentials = user.gclCredentials else {
				return HTMLResponse {
					GocardlessCredentialsRequiredPage(username: user.username)
				}
			}

			let institutions =
				try await InstitutionsAPI
				.retrieveAllSupportedInstitutionsInAGivenCountry(
					country: country,
					apiConfiguration: try await credentials.apiConfig(
						client: req.client, on: req.db)
				).get().getOrThrow()

			institutionViews = institutions.map { institution in
				InstitutionView(
					id: institution.id,
					name: institution.name,
					bic: institution.bic ?? "",
					countries: institution.countries
				)
			}
		}

		return HTMLResponse {
			GocardlessInstitutionsPage(
				username: user.username,
				institutions: institutionViews,
				country: country
			)
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
			return HTMLResponse {
				GocardlessCredentialsRequiredPage(username: user.username)
			}
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

		let apiConfig = try await credentials.apiConfig(client: req.client, on: req.db)

		let requisition = try await RequisitionsAPI.requisitionById(
			id: agreement.requisitionId, apiConfiguration: apiConfig
		).get().getOrThrow()

		var accountViews: [AvailableAccountView] = []
		for accountId in requisition.accounts ?? [] {
			let accountDetail = try await AccountsAPI.retrieveAccountDetails(
				id: accountId.uuidString, apiConfiguration: apiConfig
			).get().getOrThrow()
			let account = accountDetail.account
			accountViews.append(
				AvailableAccountView(
					accountId: accountId.uuidString,
					iban: account.iban ?? "no-iban",
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
		guard let user = try await getUser(fromRequest: req) else {
			throw Abort(.unauthorized)
		}
		let userId = try user.requireID()
		guard let credentials = user.gclCredentials else {
			return try await HTMLResponse {
				GocardlessCredentialsRequiredPage(username: user.username)
			}.encodeResponse(for: req)
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

		struct SelectAccountsRequest: Content {
			var accountIds: [String]
		}

		let body = try req.content.decode(SelectAccountsRequest.self)

		guard !body.accountIds.isEmpty else {
			throw Abort(.badRequest, reason: "No accounts selected")
		}

		let existingAccountIds = Set(
			try await GocardlessBankAccount.query(on: req.db)
				.filter(\.$user.$id == userId)
				.filter(\.$agreement.$id == agreementId)
				.all()
				.map { $0.accountId }
		)

		for accountId in body.accountIds {
			guard !existingAccountIds.contains(accountId) else { continue }
			let accountDetails = try await AccountsAPI.retrieveAccountDetails(
				id: accountId,
				apiConfiguration: try await credentials.apiConfig(
					client: req.client, on: req.db)
			).get().getOrThrow()
			let account = accountDetails.account

			let bankAccount = GocardlessBankAccount(
				userId: userId,
				agreementId: try agreement.requireID(),
				accountId: accountId,
				institutionId: agreement.institutionId,
				institutionName: agreement.institutionName,
				iban: account.iban,
				ownerName: account.ownerName,
				status: account.status,
				name: account.name
			)
			try await bankAccount.save(on: req.db)
		}

		return Vapor.Response(
			status: .seeOther,
			headers: [
				"Location":
					"/\(InstitutionsController.path)"
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
					"/\(InstitutionsController.path)"
			])
	}
}
