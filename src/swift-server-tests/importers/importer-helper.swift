import Fluent
import Queues
import Testing
import VaporTesting

@testable import MrScroogeServer

let SAMPLE_DATA: [[String: any Sendable]] = [
	["movementName": "first", "date": "1990-03-01", "value": -20.0],
	["movementName": "second", "date": "1990-03-02", "value": -10.0],
	["movementName": "ingress", "date": "1990-03-03", "value": 100.0],
	["movementName": "first.second", "date": "1990-03-04", "value": -5.0],
]

class TestBasicImporter: ParserFactory {

	let fileRegex = ""
	let key: String

	let transformHelper: TransformHelper<[String: Any]>

	let data: [[String: Any]]

	init(key: String? = nil, data: [[String: Any]]? = nil) {
		let fieldsMap = FieldsMap<String>(
			movementName: "movementName",
			date: "date",
			value: "value"
		)
		self.transformHelper = TransformHelper(fieldsMap, dateFormat: "yyyy-MM-dd")
		self.data = data ?? SAMPLE_DATA
		self.key = key ?? "test-account"
	}

	func create(filePath: String) -> AsyncThrowingStream<PartialBankTransaction, Error> {
		return AsyncThrowingStream { continuation in
			do {
				for row in self.data {
					let transaction = try self.transformHelper.map(row)
					continuation.yield(transaction)
				}
				continuation.finish()
			} catch {
				continuation.finish(throwing: error)
			}
		}
	}
}

class TestDynamicImporter: ParserFactory {
	let fileRegex = ""
	let key = "test-dynamic"
	let amount: Int

	init(amount: Int = 10) {
		self.amount = amount
	}

	func create(filePath: String) -> AsyncThrowingStream<PartialBankTransaction, Error> {
		return AsyncThrowingStream { continuation in
			for index in 0..<self.amount {
				let transaction = PartialBankTransaction(
					movementName: "movement \(index)",
					date: DateOnly(
						ISO8601DateFormatter().string(from: Date()))!,
					value: Double(index)
				)
				continuation.yield(transaction)
			}
			continuation.finish()
		}
	}
}

struct ImporterTestServices {
	var importerService: NewImportService
	var bankTransactionService: BankTransactionService
	var statusReportsService: FileImportService

	init(app: Application, parsers testParsers: [ParserFactory]) {
		importerService = NewImportService(parsers: testParsers, withApp: app)
		bankTransactionService = app.bankTransactionService
		statusReportsService = app.fileImportService
	}
}

class BaseImporterTesting {
	func checkMovement(
		transactions: [BankTransaction], date: DateOnly, value: Double, movementName: String
	) {
		let queryTest = transactions.first(where: { $0.date == date })
		#expect(queryTest != nil)
		#expect(queryTest?.value == value)
		#expect(queryTest?.movementName == movementName)
	}
}
