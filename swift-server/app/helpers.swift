import Vapor

func notFoundResponse(req: Request) -> Response {
	return .init(
		status: .notFound, body: .init(string: "Not found!"))
}
/*
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
*/
// Define a protocol for collections that use a specific type as an index
protocol IndexedCollection {
	associatedtype IndexType: Hashable
	associatedtype ValueType

	func get(_ index: IndexType) -> ValueType?
}

// Extend Array to conform to IndexedCollection with IndexType as Int
extension Array: IndexedCollection {
	typealias IndexType = Int
	typealias ValueType = Element

	func get(_ index: Int) -> Element? {
		if self.count > index {
			return self[index]
		}
		return nil
	}
}

// Extend Dictionary to conform to IndexedCollection with IndexType as the Dictionary's Key
extension Dictionary: IndexedCollection {
	typealias IndexType = Key
	typealias Element = Value

	func get(_ index: Key) -> Value? {
		return self[index]
	}
}
