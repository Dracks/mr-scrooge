import Exceptions
import GoCardlessClient
import Vapor

extension TokenAPI.ObtainNewAccessRefreshTokenPair {
	func getOrThrow() throws -> SpectacularJWTObtain {
		switch self {
		case .http200(let value, _):
			return value
		case .http401(let error, let raw):
			throw Exception(
				ErrorCodes.E10010,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http403(let error, let raw):
			throw Exception(
				ErrorCodes.E10010,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http429(let error, let raw):
			throw Exception(
				ErrorCodes.E10010,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http0(let raw):
			throw Exception(
				ErrorCodes.E10010,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: raw),
				]
			)
		}
	}
}

extension TokenAPI.GetANewAccessToken {
	func getOrThrow() throws -> SpectacularJWTRefresh {
		switch self {
		case .http200(let value, _):
			return value
		case .http401(let error, let raw):
			throw Exception(
				ErrorCodes.E10011,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http403(let error, let raw):
			throw Exception(
				ErrorCodes.E10011,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http429(let error, let raw):
			throw Exception(
				ErrorCodes.E10011,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http0(let raw):
			throw Exception(
				ErrorCodes.E10011,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: raw),
				]
			)
		}
	}
}
