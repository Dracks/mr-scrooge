import Foundation
import Graphiti
import Vapor
import GraphQL

struct WrongOwnerId {
    let validOwners: [UUID]
}

class BaseSchema: PartialSchema<MrScroogeResolver, Request> {
    @TypeDefinitions
    override var types: Types {
        Type(WrongOwnerId.self) {
            Field("validOwners", at: \.validOwners)
        }
        Scalar(DateOnly.self, as: "DateOnly", serialize: { value, coder in
            return Map("\(value)")
        })
        Scalar(UUID.self, as: "UUID")
    }
}

