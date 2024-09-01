import Foundation
import Vapor

protocol ParserFactory {
	func create(filePath: String) -> AnySequence<BankTransaction>
	var fileRegex: String { get }
	var key: String { get }
}
/*
class NewImportService {
    private var parsersMap: [String: ParserFactory]

    private let bankTransactionService: BankTransactionService
    private let statusReportModel: StatusReport.Type
    private let statusReportRowModel: StatusReportRow.Type

    init(parsers: [ParserFactory], bankTransactionService: BankTransactionService, statusReportModel: StatusReport.Type, statusReportRowModel: StatusReportRow.Type) {
        self.parsersMap = Dictionary(uniqueKeysWithValues: parsers.map { ($0.key, $0) })
        self.bankTransactionService = bankTransactionService
        self.statusReportModel = statusReportModel
        self.statusReportRowModel = statusReportRowModel
    }

    func generateStatusTransaction(status: StatusReport, transaction: BankTransactionBase) -> StatusReportRow {
        return statusReportRowModel.init(reportId: status.id, transaction: transaction)
    }

    func `import`(groupOwnerId: Int, key: String, fileName: String, filePath: String) async throws {
        let status = statusReportModel.init(description: "", fileName: fileName, groupOwnerId: groupOwnerId, kind: key, status: "OK")

        do {
            try await status.save()

            guard let parser = parsersMap[key] else {
                throw Exception(.E10003, context: ["parserKey": key])
            }

            let source = parser.create(filePath: filePath)
            var discarting = true
            var previous: BankTransactionBase?
            var previousState: StatusReportRow?

            for try await transaction in source {
                let statusTransaction = generateStatusTransaction(status: status, transaction: transaction)

                if try await bankTransactionService.existsSimilar(groupOwnerId: groupOwnerId, key: key, transaction: transaction) {
                    if discarting {
                        let msg = "repeated row, not inserted"
                        status.status = "WARN"
                        statusTransaction.message = msg

                        if let prevState = previousState {
                            prevState.message = msg
                            try await prevState.save()
                            previousState = nil
                        }
                        try await statusTransaction.save()
                    } else {
                        previous = transaction
                        previousState = statusTransaction
                        discarting = true
                    }
                } else {
                    if let prev = previous, let prevState = previousState {
                        let record = try await bankTransactionService.addTransaction(kind: key, groupOwnerId: groupOwnerId, transaction: prev)
                        prevState.message = "Repeated row, but inserted"
                        prevState.transactionId = record.id
                        try await prevState.save()
                        previous = nil
                        previousState = nil
                    }
                    discarting = false
                    let record = try await bankTransactionService.addTransaction(kind: key, groupOwnerId: groupOwnerId, transaction: transaction)
                    statusTransaction.transactionId = record.id
                    try await statusTransaction.save()
                }
            }
        } catch {
            let errorDict = Exception.getStdDict(error)
            status.description = errorDict.message
            status.stack = errorDict.stack
            status.context = errorDict.context.map { JSONEncoder().encode($0) }
            status.status = "ERR"
            try await status.save()
        }

        try await status.save()
    }
}
*/
