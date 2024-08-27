import Foundation
import Graphiti
import Vapor

// GetPageResponse
struct GetPageResponse<T: Codable>: Codable {
    let results: [T]
    let next: String?
}

class BankTransactionTypes {
    // BankTransaction
    struct BankTransaction: Codable {
        let id: UUID
        let groupOwnerId: UUID
        let movementName: String
        let date: DateOnly
        let dateValue: DateOnly?
        let details: String?
        let value: Double
        let kind: String
        let description: String?
        
        func labelIds(req: Request, parent: BankTransaction) async throws -> [UUID] {
            return try await BankTransactionServices.labelService.getLabelsIdForTransaction(req: req, transactionId: parent.id)
        }
    }

    // GetBankTransactionsResponse
    struct GetBankTransactionsResponse: Codable {
        let results: [BankTransaction]
        let next: String?
    }
    
    struct GetBankTransactionArgs: Codable {
        let groupIds: [UUID]
        let cursor: String?
        let limit: Int?
    }

    class Schema: PartialSchema<MrScroogeResolver, Request> {
        @TypeDefinitions
        override var types: Types {
            Type(BankTransaction.self) {
                Field("id", at: \.id)
                Field("groupOwnerId", at: \.groupOwnerId)
                Field("movementName", at: \.movementName)
                Field("date", at: \.date)
                Field("dateValue", at: \.dateValue)
                Field("details", at: \.details)
                Field("value", at: \.value)
                Field("kind", at: \.kind)
                Field("description", at: \.description)
                Field("labelIds", at: BankTransaction.labelIds)
            }
            
            Type(GetBankTransactionsResponse.self) {
                Field("results", at: \.results)
                Field("next", at: \.next)
            }
        }
        
        @FieldDefinitions
        override var query: Fields {
            Field("bankTransaction", at: MrScroogeResolver.bankTransaction) {
                Argument("groupIds", at: \.groupIds)
                Argument("cursor", at: \.cursor)
                Argument("limit", at: \.limit)
            }
        }
    }
}

extension MrScroogeResolver  {
    
    
    func bankTransaction(req: Request, arguments: BankTransactionTypes.GetBankTransactionArgs) async throws -> BankTransactionTypes.GetBankTransactionsResponse {
        let data = try await BankTransactionServices.bankTransactionService.getAll(on: req.db, groupIds: arguments.groupIds, cursor: arguments.cursor, limit: arguments.limit ?? 100)
        let results = try data.list.map { movement in
            BankTransactionTypes.BankTransaction(
                id: try movement.requireID(),
                groupOwnerId: movement.groupOwnerId,
                movementName: movement.movementName,
                date: movement.date,
                dateValue: movement.dateValue,
                details: movement.details,
                value: movement.value,
                kind: movement.kind,
                description: movement.description
            )
        }
        return BankTransactionTypes.GetBankTransactionsResponse(results: results, next: data.next)
    }
}

class BankTransactionServices {
    static let bankTransactionService: BankTransactionService = BankTransactionService()
    static let labelService = LabelService()
}


