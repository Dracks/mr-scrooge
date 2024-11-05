import Dependencies
import Vapor

extension DependencyValues {
	var request: Request {
		get { self[RequestKey.self] }
		set { self[RequestKey.self] = newValue }
	}

	private enum RequestKey: DependencyKey {
		static var liveValue: Request {
			fatalError("Value of type \(Value.self) is not registered in this context")
		}
	}
}

struct OpenAPIRequestInjectionMiddleware: AsyncMiddleware {
	func respond(
		to request: Request,
		chainingTo responder: AsyncResponder
	) async throws -> Response {
		try await withDependencies {
			$0.request = request
		} operation: {
			try await responder.respond(to: request)
		}
	}
}
