import CSV
import Foundation
import Vapor

final class CommerzBankEnImporter: ParserFactory, Sendable {
	let DATE_REGEX = try! NSRegularExpression(
		pattern: "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})T\\d{2}:\\d{2}:\\d{2}",
		options: [])
	let transformHelper: TransformHelper<[String?]>
	let key: String = "commerz-bank-2024/en"
	let fileRegex: String = "^[A-Z]{2}(?:[ ]?[0-9]){18,20}_"

	init() {
		let fieldsMap = FieldsMap<Int>(
			movementName: 8,
			date: 10,
			dateValue: 1,
			details: 9, value: 4
		)
		self.transformHelper = TransformHelper(fieldsMap, dateFormat: "dd.MM.yyyy")
	}

	func splitMessage(_ msg: String) throws -> (String, String?, String?) {
		var message = msg

		if message.hasPrefix("/") {
			let subMsgs = message.components(separatedBy: "//").filter {
				$0.hasPrefix("Kartenzahlung")
			}
			if let msg = subMsgs.first {
				message = msg
			}
		}

		if let doubleSlashIndex = message.range(of: "//") {
			message = String(message.prefix(upTo: doubleSlashIndex.lowerBound))
		}

		let dateMatch = DATE_REGEX.firstMatch(
			in: message, options: [], range: NSRange(location: 0, length: message.count)
		)
		if let dateMatch {
			let range = Range(dateMatch.range(at: 0), in: message)
			guard let range = range else {
				throw Exception(.E10000)
			}
			var movementName = String(message[..<range.lowerBound])
			let dayRange = Range(dateMatch.range(withName: "day"), in: message)
			let monthRange = Range(dateMatch.range(withName: "month"), in: message)
			let yearRange = Range(dateMatch.range(withName: "year"), in: message)
			let dateInfo =
				"\(message[dayRange!]).\(message[monthRange!]).\(message[yearRange!])"
			var details: String?
			if let slashIndex = movementName.firstIndex(of: "/") {
				details = String(movementName[slashIndex...]).trimmingCharacters(
					in: .whitespaces)
				movementName.removeSubrange(slashIndex...)
			}

			return (
				movementName.trimmingCharacters(in: .whitespaces), details, dateInfo
			)
		} else if let endToEndIndex = message.range(of: "End-To-End") {
			message = String(message.prefix(upTo: endToEndIndex.lowerBound))
		}

		return (message.trimmingCharacters(in: .whitespaces), nil, nil)
	}

	func create(filePath: String) -> AsyncThrowingStream<PartialBankTransaction, Error> {
		AsyncThrowingStream { continuation in
			Task {
				do {
					let csv = try parseCsv(filePath: filePath, delimiter: ";")

					var lineCounter = 0
					while let row = csv.next() {
						lineCounter += 1
						do {
							var mappedData: [String?] = row
							guard let originalMovement = row.get(3)
							else {
								throw Exception(.E10012)
							}

							guard let originalValue = row.get(4) else {
								throw Exception(.E10013)
							}

							mappedData[4] =
								originalValue.replacingOccurrences(
									of: ",", with: ".")

							let (movementName, details, newDate) =
								try splitMessage(
									originalMovement)

							mappedData.append(
								String(movementName.prefix(250)))
							mappedData.append(details)
							if let newDate = newDate {
								mappedData.append(newDate)
							} else {
								mappedData.append(row[0])
							}
							let transaction = try self.transformHelper
								.map(mappedData)
							continuation.yield(transaction)
						} catch {
							throw Exception(
								.E10011,
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
