import Exceptions
import GoCardlessClient
import Vapor

extension InstitutionsAPI.RetrieveAllSupportedInstitutionsInAGivenCountry {
	func getOrThrow() throws -> [Integration] {
		switch self {
		case .http200(let value, _):
			return value
		case .http400(let error, let raw):
			throw Exception(
				ErrorCodes.E10012,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http401(let error, let raw):
			throw Exception(
				ErrorCodes.E10012,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http403(let error, let raw):
			throw Exception(
				ErrorCodes.E10012,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http404(let error, let raw):
			throw Exception(
				ErrorCodes.E10012,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http429(let error, let raw):
			throw Exception(
				ErrorCodes.E10012,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http0(let raw):
			throw Exception(
				ErrorCodes.E10012,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: raw),
				]
			)
		}
	}
}

extension InstitutionsAPI.RetrieveInstitution {
	func getOrThrow() throws -> IntegrationRetrieve {
		switch self {
		case .http200(let value, _):
			return value
		case .http401(let error, let raw):
			throw Exception(
				ErrorCodes.E10013,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http403(let error, let raw):
			throw Exception(
				ErrorCodes.E10013,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http404(let error, let raw):
			throw Exception(
				ErrorCodes.E10013,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http429(let error, let raw):
			throw Exception(
				ErrorCodes.E10013,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http0(let raw):
			throw Exception(
				ErrorCodes.E10013,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: raw),
				]
			)
		}
	}
}
