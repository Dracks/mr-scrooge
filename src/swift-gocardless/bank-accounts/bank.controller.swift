import Fluent
import Vapor

struct BankController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        let banks = routes.grouped("banks")

        // Enable bank connection routes
        banks.get("select", use: showBankSelection)
        banks.post("connect", use: initiateConnection)
        banks.get("callback", use: handleCallback)
        banks.get("accounts", use: showAccounts)
        banks.post("accounts", ":accountID", "toggle", use: toggleAccount)
        banks.get("transactions", ":accountID", use: getTransactions)
    }

    // Show available banks for connection
    func showBankSelection(req: Request) async throws -> View {
        // Get current user
        guard let userIdString = req.session.data["user_id"],
            let userId = UUID(uuidString: userIdString),
            let user = try await User.find(userId, on: req.db)
        else {
            return try await req.view.render("create-user")
        }

        let service = try createGoCardlessService(req: req)
        let institutions = try await service.getInstitutions(country: "GB")

        struct BankSelectionContext: Encodable {
            let title: String
            let user: User
            let institutions: [GoCardlessInstitution]
        }

        let context = BankSelectionContext(
            title: "Select Bank",
            user: user,
            institutions: institutions
        )

        return try await req.view.render("bank-selection", context)
    }

    // Initiate bank connection
    func initiateConnection(req: Request) async throws -> Response {
        struct ConnectData: Content {
            let institutionId: String
            let institutionName: String
        }

        let data = try req.content.decode(ConnectData.self)

        guard let userIdString = req.session.data["user_id"],
            let userId = UUID(uuidString: userIdString),
            let user = try await User.find(userId, on: req.db)
        else {
            throw Abort(.unauthorized, reason: "User not found in session")
        }

        let service = try createGoCardlessService(req: req)

        // Create end user agreement
        let agreement = try await service.createEndUserAgreement(
            institutionId: data.institutionId
        )

        // Create requisition
        let baseURL = Environment.get("BASE_URL") ?? "http://localhost:8080"
        let redirectUrl = "\(baseURL)/banks/callback"

        let requisition = try await service.createRequisition(
            institutionId: data.institutionId,
            redirectUrl: redirectUrl,
            agreementId: agreement.id,
            reference: user.id?.uuidString
        )

        // Save connection
        let connection = BankConnection(
            userID: user.id!,
            institutionId: data.institutionId,
            institutionName: data.institutionName,
            requisitionId: requisition.id,
            status: requisition.status
        )
        try await connection.save(on: req.db)

        // Store requisition ID in session
        req.session.data["requisition_id"] = requisition.id

        // Redirect user to GoCardless authorization
        guard let link = requisition.link else {
            throw Abort(.internalServerError, reason: "No authorization link provided")
        }

        return req.redirect(to: link)
    }

    // Handle callback from GoCardless
    func handleCallback(req: Request) async throws -> Response {
        guard let ref = try? req.query.get(String.self, at: "ref") else {
            throw Abort(.badRequest, reason: "Missing requisition reference")
        }

        // Find connection by requisition ID
        guard
            let connection = try await BankConnection.query(on: req.db)
                .filter(\.$requisitionId == ref)
                .with(\.$user)
                .first()
        else {
            throw Abort(.notFound, reason: "Connection not found")
        }

        let service = try createGoCardlessService(req: req)
        let requisition = try await service.getRequisition(id: ref)

        // Update connection status
        connection.status = requisition.status
        try await connection.save(on: req.db)

        // Sync accounts if successful
        if requisition.status == "LN" { // Linked status
            for accountId in requisition.accounts {
                // Check if account already exists
                let existingAccount = try await BankAccount.query(on: req.db)
                    .filter(\.$accountId == accountId)
                    .first()

                if existingAccount == nil {
                    let details = try await service.getAccountDetails(id: accountId)

                    let account = BankAccount(
                        bankConnectionID: connection.id!,
                        accountId: accountId,
                        iban: details.iban,
                        accountName: details.name,
                        currency: nil, // Not available in the basic details
                        ownerName: details.ownerName,
                        isEnabled: true
                    )
                    try await account.save(on: req.db)
                }
            }
        }

        // Redirect to accounts page
        return req.redirect(to: "/banks/accounts")
    }

    // Show all accounts for user
    func showAccounts(req: Request) async throws -> View {
        guard let userIdString = req.session.data["user_id"],
            let userId = UUID(uuidString: userIdString),
            let user = try await User.find(userId, on: req.db)
        else {
            return try await req.view.render("create-user")
        }

        // Get all accounts across all connections
        let accounts = try await BankAccount.query(on: req.db)
            .join(
                BankConnection.self,
                on: \BankAccount.$bankConnection.$id == \BankConnection.$id
            )
            .filter(BankConnection.self, \.$user.$id == userId)
            .with(\.$bankConnection)
            .all()

        struct AccountsContext: Encodable {
            let title: String
            let user: User
            let accounts: [BankAccount]
        }

        let context = AccountsContext(
            title: "My Bank Accounts",
            user: user,
            accounts: accounts
        )

        return try await req.view.render("accounts", context)
    }

    // Toggle account enabled status
    func toggleAccount(req: Request) async throws -> Response {
        guard let accountId = req.parameters.get("accountID", as: UUID.self) else {
            throw Abort(.badRequest)
        }

        guard let account = try await BankAccount.find(accountId, on: req.db) else {
            throw Abort(.notFound)
        }

        account.isEnabled.toggle()
        try await account.save(on: req.db)

        return req.redirect(to: "/banks/accounts")
    }

    // Get transactions for a specific account
    func getTransactions(req: Request) async throws -> [GoCardlessTransaction] {
        guard let accountId = req.parameters.get("accountID", as: String.self) else {
            throw Abort(.badRequest, reason: "Account ID is required")
        }

        let service = try createGoCardlessService(req: req)

        // Get transactions for the account
        let transactionsResponse = try await service.getAccountTransactions(id: accountId)

        // Return the booked transactions
        return transactionsResponse.transactions.booked
    }

    // Helper method to create GoCardless service
    private func createGoCardlessService(req: Request) throws -> GoCardlessService {
        guard let secretId = Environment.get("GOCARDLESS_SECRET_ID"),
            let secretKey = Environment.get("GOCARDLESS_SECRET_KEY")
        else {
            throw Abort(
                .internalServerError,
                reason: "GoCardless credentials not configured")
        }

        let baseURL = Environment.get("GOCARDLESS_BASE_URL") ?? "https://bankaccountdata.gocardless.com/api/v2"

        return GoCardlessService(
            client: req.application.http.client.shared,
            baseUrl: baseURL,
            secretId: secretId,
            secretKey: secretKey
        )
    }
}
