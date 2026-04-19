import Fluent
import Foundation
import Vapor

struct CreateOAuthAppCommand: AsyncCommand {
    struct Signature: CommandSignature {
        @Argument(name: "Name", help: "Application name")
        var name: String

        @Argument(name: "Uri",  help: "Redirect uri")
        var uri: String

        @Option(name: "description", short: "d")
        var description: String?

        @Flag(name: "user-info", short: "u", help: "To provide user info scope")
        var userInfo: Bool
    }

    var help: String {
        "Creates an oauth application"
    }

    func run(using context: CommandContext, signature: Signature) async throws {
        let app = context.application

        var scopes: [Scope] = []

        if signature.userInfo {
            scopes.append(.user)
        }

        let oauthApp = try await app.oauthClientService.registerClient(name: signature.name, description: signature.description, redirectUris: [signature.uri], scopes: scopes)

        print("App created with clientId: \(oauthApp.client_id)")
        print("Secret: \(oauthApp.secret)")
        
    }
}
