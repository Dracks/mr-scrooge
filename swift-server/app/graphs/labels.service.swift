import Fluent
import Vapor

struct LabelService {
    func createLabel(req: Request, label: Label) async throws -> Label {
        try await label.save(on: req.db)
        return label
    }

    func addTransaction(req: Request, labelTransaction: LabelTransaction) async throws -> LabelTransaction {
        try await labelTransaction.save(on: req.db)
        return labelTransaction
    }

    func getAll(req: Request, groupIds: [UUID]) async throws -> [Label] {
        try await Label.query(on: req.db)
            .filter(\.$groupOwner.$id ~~ groupIds)
            .all()
    }

    func getLabelsIdForTransaction(req: Request, transactionId: UUID) async throws -> [UUID] {
        let labelTransactions = try await LabelTransaction.query(on: req.db)
            .filter(\.$transaction.$id == transactionId)
            .all()
        
        return labelTransactions.map { $0.$label.id }
    }
}
