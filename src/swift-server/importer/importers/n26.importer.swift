import CSV
import Foundation
import Vapor

final class N26Importer: ParserFactory, Sendable {
	let transformHelper: TransformHelper<[String]>
	let key: String = "n26/es"
	let fileRegex: String = "Cuenta.*\\.csv"

	init() {
		let fieldsMap = FieldsMap<Int>(
			movementName: 2,
			date: 0,
			dateValue: 1,
			details: 5,
			value: 7
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
