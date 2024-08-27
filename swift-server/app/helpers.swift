import Vapor

func notFoundResponse(req: Request) -> Response {
	return .init(
		status: .notFound, body: .init(string: "Not found!"))
}

class GenericError: Error {
	let message: String

	init(msg: String) {
		message = msg
	}
}

protocol ValidatorCheck<O, E> {
	associatedtype O
	associatedtype E

	var error: E { get }

	func check(_ data: O) -> Bool
}

class Validator<Obj, Err> {
	var validations: [any ValidatorCheck<Obj, Err>]
	init(validations: [any ValidatorCheck<Obj, Err>]) {
		self.validations = validations
	}
	func validate(_ data: Obj) -> [Err] {
		return self.validations.filter { check in
			return !check.check(data)
		}.map { check in
			return check.error
		}
	}
}
