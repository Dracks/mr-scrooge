import Foundation
import GraphQL
import Graphiti
import Vapor

struct WrongOwnerId {
	let validOwners: [UUID]
}

struct InvalidLabels {
	var validLabels: [UUID]
	let invalidLabels: [UUID]
}

struct DeleteConfirmation {
	let confirm: Bool
}

class BaseSchema: PartialSchema<MrScroogeResolver, Request> {
	@TypeDefinitions
	override var types: Types {
		Type(WrongOwnerId.self) {
			Field("validOwners", at: \.validOwners)
		}
		Scalar(
			DateOnly.self, as: "DateOnly",
			serialize: { value, coder in
				return Map("\(value)")
			})
		Scalar(UUID.self, as: "UUID")
		Type(InvalidLabels.self) {
			Field("validLabels", at: \.validLabels)
			Field("invalidLabels", at: \.invalidLabels)
		}
		Type(DeleteConfirmation.self) {
			Field("confirm", at: \.confirm)
		}
	}
}
