import Foundation
import Graphiti
import Vapor

// GetPageResponse
struct GetPageResponse<T: Codable>: Codable {
    let results: [T]
    let next: String?
}

class BankTransactionTypes {
    static let bankTransactionService: BankTransactionService = BankTransactionService()
    static let labelService = LabelService()
    
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
        let labels: [UUID]
        
        /*func labelIds(req: Request, parent: BankTransaction) async throws -> [UUID] {
            return try await BankTransactionServices.labelService.getLabelsIdForTransaction(req: req, transactionId: parent.id)
        }*/
    }

    // GetBankTransactionsResponse
    struct BankTransactionsResponse: Codable, GetBankTransactionsResponse {
        let results: [BankTransaction]
        let next: String?
    }
    
    protocol GetBankTransactionsResponse {}
    
    struct GetBankTransactionArgs: Codable {
        let groupIds: [UUID]?
        let cursor: String?
        let limit: Int?
    }

    struct GqlLabel: Codable {
        let id: UUID
        let name: String
        let groupOwnerId: UUID
        
        init(label: Label) throws {
            self.id = try label.requireID()
            self.name = label.name
            self.groupOwnerId = label.$groupOwner.id
        }
    }
    struct GetLabels: Codable, GetLabelsResponse {
        let labels: [GqlLabel]
        
        init(_ labels: [GqlLabel]){
            self.labels = labels
        }
    }
    protocol GetLabelsResponse {}

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
                Field("labelIds", at: \.labels)
            }
            
            Type(BankTransactionsResponse.self, as: "BankTransactionResponse") {
                Field("results", at: \.results)
                Field("next", at: \.next)
            }
            Union(GetBankTransactionsResponse.self, members: BankTransactionsResponse.self, WrongOwnerId.self )
            
            Type(GqlLabel.self, as: "Label") {
                Field("id", at: \.id)
                Field("name", at: \.name)
                Field("groupOwnerId", at: \.groupOwnerId)
            }
            
            Type(GetLabels.self) {
                Field("results", at: \.labels)
            }
            
            Union(GetLabelsResponse.self, members: GetLabels.self, NotIdentified.self)
            
        }
        
        @FieldDefinitions
        override var query: Fields {
            Field("bankTransaction", at: MrScroogeResolver.bankTransaction) {
                Argument("groupIds", at: \.groupIds)
                Argument("cursor", at: \.cursor)
                Argument("limit", at: \.limit)
            }
            Field("labels", at: MrScroogeResolver.labels)
        }
    }
}

extension MrScroogeResolver  {
    
    
    func bankTransaction(req: Request, arguments: BankTransactionTypes.GetBankTransactionArgs) async throws -> BankTransactionTypes.GetBankTransactionsResponse {
        do {
            let user = try await getUser(fromRequest: req);
            let validGroupsIds = try user.groups.map { return try $0.requireID() }
            let groupIds = arguments.groupIds ?? validGroupsIds
            if groupIds.filter({return !validGroupsIds.contains($0)} ).count>0 {
                return WrongOwnerId(validOwners: validGroupsIds)
            }
            let data = try await BankTransactionTypes.bankTransactionService.getAll(on: req.db, groupIds: groupIds, cursor: arguments.cursor, limit: arguments.limit ?? 100)
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
                    description: movement.description, 
                    labels: try movement.labels.map({ label in
                        return try label.requireID()
                    })
                )
            }
            return BankTransactionTypes.BankTransactionsResponse(results: results, next: data.next)
        } catch let error as NotIdentifiedError {
            return NotIdentified()
        }
    }
    
    func labels(req: Request, arguments: NoArguments) async throws -> BankTransactionTypes.GetLabelsResponse {
        do {
            let user = try await getUser(fromRequest: req);
            let validGroupsIds = try user.groups.map { return try $0.requireID() }
            let data = try await BankTransactionTypes.labelService.getAll(on: req.db, groupIds: validGroupsIds)
            let list = try data.map({ label in
                return try BankTransactionTypes.GqlLabel(label: label)
            })
            return BankTransactionTypes.GetLabels(list)
            
            
        } catch let error as NotIdentifiedError {
            return NotIdentified()
        }
        
    }
}

extension WrongOwnerId: BankTransactionTypes.GetBankTransactionsResponse {}
extension NotIdentified: BankTransactionTypes.GetLabelsResponse, BankTransactionTypes.GetBankTransactionsResponse {}

