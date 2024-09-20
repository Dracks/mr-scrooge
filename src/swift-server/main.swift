import Foundation
import Vapor

// Create your Vapor application.
let app = try await Vapor.Application.make()

try await configure(app)

// Start the app as you would normally.
try await app.execute()
