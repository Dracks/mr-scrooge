import CSV
import Foundation
import SwiftSoup

func parserHtml(filePath: String, encoding: String.Encoding) -> AsyncThrowingStream<
	HTMLRowData, Error
> {
	return AsyncThrowingStream { continuation in
		Task {
			do {
				guard let fileData = FileManager.default.contents(atPath: filePath)
				else {
					throw Exception(.E10006, context: ["fileName": filePath])
				}
				guard let fileString = String(data: fileData, encoding: encoding)
				else {
					throw Exception(.E10007, context: ["fileName": filePath])
				}

				let doc: Document = try SwiftSoup.parse(fileString)
				let rows: Elements = try doc.select("tr")
				var line = 1
				for row in rows.array() {
					let cells = row.children()
					let cellData = cells.array().enumerated().reduce(
						into: [Int: String]()
					) { dict, pair in
						dict[pair.offset] = try? pair.element.text()
					}
					continuation.yield(HTMLRowData(line: line, data: cellData))
					line += 1
				}
				continuation.finish()
			} catch {
				continuation.finish(throwing: error)
			}
		}
	}
}

func parseCsv(filePath: String) throws -> CSVReader {
	do {
		let stream = InputStream(fileAtPath: filePath)
		guard let stream = stream else {
			throw Exception(.E10008, context: ["fileName": filePath])
		}

		return try CSVReader(stream: stream, hasHeaderRow: true)
	} catch {
		if let error = error as? Exception {
			throw error
		}
		if let error = error as? CSVError {
			switch error {
			case .cannotOpenFile:
				throw Exception(.E10010, context: ["fileName": filePath])
			default:
				throw error
			}
		}
		throw error

	}
}