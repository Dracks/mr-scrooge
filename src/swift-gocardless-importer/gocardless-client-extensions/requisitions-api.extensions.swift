import Exceptions
import GoCardlessClient
import Vapor

extension RequisitionsAPI.CreateRequisition {
	func getOrThrow() throws -> SpectacularRequisition {
		switch self {
		case .http201(let value, _):
			return value
		case .http400(let error, let raw):
			throw Exception(
				ErrorCodes.E10015,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http401(let error, let raw):
			throw Exception(
				ErrorCodes.E10015,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http402(let error, let raw):
			throw Exception(
				ErrorCodes.E10015,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http403(let error, let raw):
			throw Exception(
				ErrorCodes.E10015,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http404(let error, let raw):
			throw Exception(
				ErrorCodes.E10015,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http429(let error, let raw):
			throw Exception(
				ErrorCodes.E10015,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http0(let raw):
			throw Exception(
				ErrorCodes.E10015,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: raw),
				]
			)
		}
	}
}

extension RequisitionsAPI.RequisitionById {
	func getOrThrow() throws -> Requisition {
		switch self {
		case .http200(let value, _):
			return value
		case .http400(let error, let raw):
			throw Exception(
				ErrorCodes.E10016,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http401(let error, let raw):
			throw Exception(
				ErrorCodes.E10016,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http403(let error, let raw):
			throw Exception(
				ErrorCodes.E10016,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http404(let error, let raw):
			throw Exception(
				ErrorCodes.E10016,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http429(let error, let raw):
			throw Exception(
				ErrorCodes.E10016,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: error),
				]
			)
		case .http0(let raw):
			throw Exception(
				ErrorCodes.E10016,
				context: [
					"status_code": raw.status.code,
					"response_body": String(describing: raw),
				]
			)
		}
	}
}
