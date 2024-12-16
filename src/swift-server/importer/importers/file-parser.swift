import CSV
import Foundation
import SwiftSoup

func parserHtml(filePath: String, encoding: String.Encoding) -> AsyncThrowingStream<
	HTMLRowData, Error
> {
	return AsyncThrowingStream { continuation in
		Task {
			do {
				let fileString = try String(
					contentsOfFile: filePath, encoding: encoding)

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

func parseCsv(filePath: String, delimiter: UnicodeScalar = ",") throws -> CSVReader {
	do {
		let stream = InputStream(fileAtPath: filePath)
		guard let stream = stream else {
			throw Exception(.E10008, context: ["fileName": filePath])
		}

		return try CSVReader(stream: stream, hasHeaderRow: true, delimiter: delimiter)
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
