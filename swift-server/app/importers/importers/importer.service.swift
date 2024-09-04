import Foundation
import Vapor
import Fluent

protocol ParserFactory {
    func create(filePath: String) -> any AsyncSequence
	var fileRegex: String { get }
	var key: String { get }
}

struct PartialBankTransaction {
    var movementName: String
    var date: DateOnly
    var dateValue: DateOnly?
    var details: String?
    var value: Double
    var description: String?
    var labels: [Label]?

    func toBankTransaction(kind: String, groupOwnerId: UUID) -> BankTransaction {
        return BankTransaction(
            groupOwnerId: groupOwnerId,
            movementName: movementName,
            date: date,
            dateValue: dateValue,
            details: details,
            value: value,
            kind: kind,
            description: description
        )
    }
}



class NewImportService {
    private var parsersMap: [String: ParserFactory]

    init(parsers: [ParserFactory]) {
        self.parsersMap = Dictionary(uniqueKeysWithValues: parsers.map { ($0.key, $0) })
        self.bankTransactionService = BankTransactionService()
    }

    private let bankTransactionService: BankTransactionService

    func generateStatusTransaction(status: StatusReport, transaction: PartialBankTransaction) -> StatusReportRow {
        return StatusReportRow(
            reportId: status.id!,
            movementName: transaction.movementName,
            date: transaction.date,
            dateValue: transaction.dateValue,
            details: transaction.details,
            value: transaction.value,
            description: transaction.description
        )
    }

    func `import`(on db: Database, groupOwnerId: UUID, key: String, fileName: String, filePath: String) async throws {
        let status = StatusReport(
            description: "",
            fileName: fileName,
            groupOwnerId: groupOwnerId,
            kind: key,
            status: "OK"
        )
        try await status.save(on: db)

        do {
            guard let parser = parsersMap[key] else {
                throw Abort(.notFound, reason: "Parser not found for key: \(key)")
            }

            let source = parser.create(filePath: filePath)
            var discarting = true
            var previous: BankTransaction?
            var previousState: StatusReportRow?

            for try await partialTransaction in source {
                guard let partialTransaction = partialTransaction as? PartialBankTransaction else {
                    throw Abort(.internalServerError, reason: "Sequence should contain only PartialBankTransaction")
                }
                let transaction = partialTransaction.toBankTransaction(kind: key, groupOwnerId: groupOwnerId)
                let statusTransaction = generateStatusTransaction(status: status, transaction: partialTransaction)

                if try await bankTransactionService.existsSimilar(on: db, transaction: transaction) {
                    if discarting {
                        let msg = "repeated row, not inserted"
                        status.status = "WARN"
                        statusTransaction.message = msg
                        if let previousStateValidated = previousState {
                            previousStateValidated.message = msg
                            try await previousStateValidated.save(on: db)
                            previousState = nil
                        }
                        try await statusTransaction.save(on: db)
                    } else {
                        previous = transaction
                        previousState = statusTransaction
                        discarting = true
                    }
                } else {
                    if let previousValidated = previous, let previousStateValidated = previousState {
                        let record = try await bankTransactionService.addTransaction(
                            on: db,transaction: previousValidated  )
                        previousStateValidated.message = "Repeated row, but inserted"
                        previousStateValidated.transactionId = try record.requireID()
                        try await previousStateValidated.save(on: db)
                        previous = nil
                        previousState = nil
                    }
                    discarting = false
                    let record = try await bankTransactionService.addTransaction(
                        on: db, transaction: transaction
                        
                    )
                    statusTransaction.transactionId = record.id
                    try await statusTransaction.save(on: db)
                }
            }
        } catch {
            status.description = error.localizedDescription
            status.stack = String(describing: error)
            status.context = nil  // You might want to add context if needed
            status.status = "ERR"
            try await status.save(on: db)
        }

        try await status.save(on: db)
    }
}

