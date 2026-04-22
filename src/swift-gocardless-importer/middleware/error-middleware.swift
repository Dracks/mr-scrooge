import Elementary
import Exceptions
import Fluent
import Vapor
import VaporElementary

struct ErrorPage: HTMLDocument {
	let message: String
	let statusCode: Int
	let errorCode: String?
	let context: [String: String]?
	let debug: Bool

	var title = "Error"

	var head: some HTML {
		link(.rel(.stylesheet), .href("/pico.css"))
	}

	var body: some HTML {
		header {
			h1 { "GoCardLess Importer" }
		}
		main(.class("container")) {
			h1 { "Error \(statusCode)" }

			if let errorCode = errorCode {
				article {
					header { "Error Code" }
					Elementary.code { errorCode }
				}
			}

			section {
				h2 { "Message" }
				p { message }
			}

			if debug, let context = context, !context.isEmpty {
				section {
					h2 { "Details" }
					dl {
						for (key, value) in context.sorted(by: { $0.key < $1.key }) {
							dt { key }
							dd { value }
						}
					}
				}
			}

			a(.href("/"), .role("button")) { "Go back to home" }
		}
	}
}

struct JSONErrorResponse: Content {
	let error: String
	let message: String?
	let context: [String: String]?

	func encode(to encoder: any Encoder) throws {
		var container = encoder.container(keyedBy: CodingKeys.self)
		try container.encode(error, forKey: .error)
		try container.encodeIfPresent(message, forKey: .message)
		try container.encodeIfPresent(context, forKey: .context)
	}
}

struct GocardlessErrorMiddleware: AsyncMiddleware {

	func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response {
		do {
			return try await next.respond(to: request)
		} catch {
			let logger = request.logger
			let debug = EnvConfig.shared.debug
			logger.error("Request error: \(error)")

			if let abortError = error as? Abort {
				if request.prefersJSON() {
					let response = Response(status: abortError.status)
					if debug {
						try response.content.encode(JSONErrorResponse(error: abortError.reason, message: nil, context: nil), as: .json)
					} else {
						try response.content.encode(JSONErrorResponse(error: "Request error", message: nil, context: nil), as: .json)
					}
					return response
				}

				let code = Int(abortError.status.code)
				let message = debug ? abortError.reason : "An error occurred processing your request"
				return try await HTMLResponse {
					ErrorPage(message: message, statusCode: code, errorCode: nil, context: nil, debug: debug)
				}.encodeResponse(for: request)
			}

			let errorString = "\(error)"
			let isDatabaseError = errorString.contains("database") || errorString.contains("SQL") || errorString.contains("Fluent")

			if isDatabaseError {
				logger.error("Database error: \(error)")

				if request.prefersJSON() {
					let response = Response(status: .internalServerError)
					if debug {
						try response.content.encode(
							JSONErrorResponse(error: "Database error", message: errorString, context: nil),
							as: .json
						)
					} else {
						try response.content.encode(
							JSONErrorResponse(error: "Database error", message: nil, context: nil),
							as: .json
						)
					}
					return response
				}

				let message = debug ? errorString : "A database error occurred"
				return try await HTMLResponse {
					ErrorPage(message: message, statusCode: 500, errorCode: "DB_ERROR", context: nil, debug: debug)
				}.encodeResponse(for: request)
			}

			if let exception = error as? Exception<ErrorCodes> {
				let errorCodeValue = "\(exception.errorCode)"
				let context = exception.context.mapValues { "\($0)" }
				let exceptionMessage = exception.errorCode.message

				logger.error("Exception: errorCode=\(errorCodeValue), context=\(exception.allContext)")

				if request.prefersJSON() {
					let response = Response(status: .internalServerError)
					if debug {
						try response.content.encode(
							JSONErrorResponse(error: errorCodeValue, message: exceptionMessage, context: context),
							as: .json
						)
					} else {
						try response.content.encode(
							JSONErrorResponse(error: errorCodeValue, message: nil, context: nil),
							as: .json
						)
					}
					return response
				}

				let message = debug ? exceptionMessage : "An error occurred processing your request"
				return try await HTMLResponse {
					ErrorPage(message: message, statusCode: 500, errorCode: errorCodeValue, context: context, debug: debug)
				}.encodeResponse(for: request)
			}

			if request.prefersJSON() {
				let response = Response(status: .internalServerError)
				try response.content.encode(
					JSONErrorResponse(error: "Internal server error", message: nil, context: nil),
					as: .json
				)
				return response
			}

			let message = debug ? "Error: \(error)" : "An unexpected error occurred"
			return try await HTMLResponse {
				ErrorPage(message: message, statusCode: 500, errorCode: nil, context: nil, debug: debug)
			}.encodeResponse(for: request)
		}
	}
}

extension Request {
	func prefersJSON() -> Bool {
		let accept = headers["Accept"].first ?? ""
		return accept.contains("application/json")
	}
}