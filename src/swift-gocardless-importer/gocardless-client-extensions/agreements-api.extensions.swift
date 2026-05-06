import Exceptions
import GoCardlessClient
import Vapor

extension AgreementsAPI.CreateEUA {
	func getOrThrow() throws -> EndUserAgreement {
		switch self {
		case .http201(let value, _):
			return value
		case .http400(let error, let raw):
			throw Exception(
				ErrorCodes.E10014,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http401(let error, let raw):
			throw Exception(
				ErrorCodes.E10014,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http402(let error, let raw):
			throw Exception(
				ErrorCodes.E10014,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http403(let error, let raw):
			throw Exception(
				ErrorCodes.E10014,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http429(let error, let raw):
			throw Exception(
				ErrorCodes.E10014,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http0(let raw):
			throw Exception(
				ErrorCodes.E10014,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: raw),
				]
			)
		}
	}
}
