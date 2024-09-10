import CSV
import Foundation
import Vapor

class N26Importer: ParserFactory {
    let transformHelper: TransformHelper<[String]>
	let key: String = "n26/es"
	let fileRegex: String = "n26-csv-transactions.*\\.csv"

	init() {
		let fieldsMap = FieldsMap<Int>(
			movementName: 1,
			date: 0,
			dateValue: 0,
			value: 5
		)
		self.transformHelper = TransformHelper(fieldsMap, dateFormat: "yyyy-MM-dd")
	}

	func create(filePath: String) -> AsyncThrowingStream<PartialBankTransaction, Error> {
		AsyncThrowingStream { continuation in
			Task {
				do {
					let csv = try parseCsv(filePath: filePath)

					var lineCounter = 0
					while let row = csv.next() {
						lineCounter += 1
						do {
							let transaction = try self.transformHelper
								.map(row)
							continuation.yield(transaction)
						} catch {
							throw Exception(
								.E10009,
								context: ["line": lineCounter],
								cause: error)
						}
					}

					continuation.finish()
				} catch {
					continuation.finish(throwing: error)
				}
			}
		}
	}
}
