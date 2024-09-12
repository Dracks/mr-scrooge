import CSV
import Foundation
import Vapor

class CommerzBankEnImporter: ParserFactory {
	let DATE_REGEX = try! NSRegularExpression(
		pattern: "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})T\\d{2}:\\d{2}:\\d{2}",
		options: [])
	let transformHelper: TransformHelper<[String?]>
	let key: String = "commerz-bank/en"
	let fileRegex: String = "Umsaetze_KtoNr.*\\.CSV"

	init() {
		let fieldsMap = FieldsMap<Int>(
			movementName: 9,
			date: 11,
			dateValue: 1,
			details: 10, value: 4
		)
		self.transformHelper = TransformHelper(fieldsMap, dateFormat: "dd.MM.yyyy")
	}

	func splitMessage(_ msg: String) throws -> (String, String?, String?) {
		var message = msg

		if message.hasPrefix("Auszahlung") {
			message.removeFirst("Auszahlung".count)
		} else if message.hasPrefix("Kartenzahlung") {
			message.removeFirst("Kartenzahlung".count)
		}

		let dateMatch = DATE_REGEX.firstMatch(
			in: message, options: [], range: NSRange(location: 0, length: message.count)
		)
		if let dateMatch = dateMatch {
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
		} else if let strRange = message.range(of: "End-to-End-Ref") {
			let splitMsg = message[..<strRange.lowerBound]
			return (splitMsg.trimmingCharacters(in: .whitespaces), nil, nil)
		}

		return (message.trimmingCharacters(in: .whitespaces), nil, nil)
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
							var mappedData: [String?] = row

							let (movementName, details, newDate) =
								try splitMessage(
									mappedData[3] ?? "")

							mappedData.append(movementName)
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
