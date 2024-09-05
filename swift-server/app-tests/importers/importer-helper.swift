import Foundation

@testable import App

struct SampleDataRow {
	let movementName: String
	let date: String
	let value: Double
}
let SAMPLE_DATA: [[String: Any]] = [
    ["movementName": "first", "date": "1990-03-01", "value": -20.0],
    ["movementName": "second", "date": "1990-03-02", "value": -10.0],
    ["movementName": "ingress", "date": "1990-03-03", "value": 100.0],
    ["movementName": "first.second", "date": "1990-03-04", "value": -5.0],
]

class TestBasicImporter: ParserFactory {

    let fileRegex = ""
    let key = "test-account"

    let transformHelper: TransformHelper<String>

    init() {
        let fieldsMap = FieldsMap<String>(
            movementName: "movementName",
            date: "date",
            value: "value"
        )
        self.transformHelper = TransformHelper(fieldsMap)
    }

    func create(filePath: String) -> AsyncStream<PartialBankTransaction> {
        return AsyncStream { continuation in
            for row in SAMPLE_DATA {
                do {
                    let transaction = try self.transformHelper.map(row)
                    continuation.yield(transaction)
                } catch {
                    print("Error mapping row: \(error)")
                }
            }
            continuation.finish()
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

	func create(filePath: String) -> AsyncStream<PartialBankTransaction> {
		return AsyncStream { continuation in
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
