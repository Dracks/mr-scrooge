import Exceptions
import GoCardlessClient
import Vapor

extension AccountsAPI.RetrieveAccountDetails {
	func getOrThrow() throws -> AccountDetail {
		switch self {
		case .http200(let value, _):
			return value
		case .http400(let error, let raw):
			throw Exception(
				ErrorCodes.E10017,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http401(let error, let raw):
			throw Exception(
				ErrorCodes.E10017,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http403(let error, let raw):
			throw Exception(
				ErrorCodes.E10017,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http404(let error, let raw):
			throw Exception(
				ErrorCodes.E10017,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http409(let error, let raw):
			throw Exception(
				ErrorCodes.E10017,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http429(let error, let raw):
			throw Exception(
				ErrorCodes.E10017,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http500(let error, let raw):
			throw Exception(
				ErrorCodes.E10017,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http503(let error, let raw):
			throw Exception(
				ErrorCodes.E10017,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http0(let raw):
			throw Exception(
				ErrorCodes.E10017,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: raw),
				]
			)
		}
	}
}
