import Foundation
import SwiftSoup
import Vapor
/*
enum ProcessFileStep {
    case skipping
    case skippingHeader
    case processing
}*/

struct HTMLRowData {
    var line: Int
    var data: [Int: String]
}

func parserHtml(filePath: String, encoding: String.Encoding) -> AsyncThrowingStream<HTMLRowData, Error> {
    return AsyncThrowingStream { continuation in
        Task {
            do {
                guard let fileData = FileManager.default.contents(atPath: filePath) else {
                    throw Exception(.E10006, context: ["fileName": filePath])
                }
                guard let fileString = String(data: fileData, encoding: encoding) else {
                    throw Exception(.E10007, context: ["fileName": filePath])
                }

                let doc: Document = try SwiftSoup.parse(fileString)
                let rows: Elements = try doc.select("tr")
                var line = 1
                for row in rows.array(){
                    let cells = row.children()
                    let cellData = cells.array().enumerated().reduce(into: [Int: String]()) { dict, pair in
                        dict[pair.offset] = try? pair.element.text()
                    }
                    continuation.yield(HTMLRowData(line: line, data: cellData));
                    line += 1
                }
                continuation.finish()
            } catch {
                continuation.finish(throwing: error)
            }
        }
    }
}

class CaixaEnginyersAbstractImporter: ParserFactory {
    
    let transformHelper: TransformHelper<Int>
    let key: String
    let fileRegex: String
    let skipAfterHeader: Int

    init(fieldsMap: FieldsMap<Int>, key: String, fileRegex: String, skipAfterHeader: Int=2) {
        self.transformHelper = TransformHelper(fieldsMap, dateFormat: "dd/MM/yyyy")
        self.key = key
        self.fileRegex = fileRegex
        self.skipAfterHeader = skipAfterHeader
    }

    func create(filePath: String) -> AsyncThrowingStream<PartialBankTransaction, Error> {
        AsyncThrowingStream { continuation in
            Task {
                do {
                    let dataList = parserHtml(filePath: filePath, encoding: .windowsCP1252)
                    let headersClean = dataList.dropFirst().drop { row in
                        row.data.count > 1
                    }.dropFirst(self.skipAfterHeader)
                    
                    
                    for try await row in headersClean {
                        var cellData = row.data
                        print(cellData)
                        if cellData.count == 1 {
                            break;
                        }
                        if cellData[1] != "" {
                            if let valueStr = cellData[transformHelper.mapping.value] {
                                cellData[transformHelper.mapping.value] = valueStr.replacing(".", with: "").replacing(",", with: ".")
                            }
                            
                            do {
                                let transaction = try self.transformHelper.map(cellData)
                                continuation.yield(transaction)
                                
                            } catch {
                                throw Exception(.E10005, context: ["line": row.line], cause: error)
                            }
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

class CaixaEnginyersAccountImporter: CaixaEnginyersAbstractImporter {
    init() {
        let fieldsMap = FieldsMap<Int>(
            movementName: 2,
            date: 1,
            dateValue: 3,
            details: 6,
            value: 4
        )
        super.init(fieldsMap: fieldsMap, key: "caixa-enginyers/account", fileRegex: "MovimientosCuenta.*\\.xls")
    }

    func splitMessage(_ message: String) -> (String, String) {
        if message.hasPrefix("R/ ") {
            return ("Bill", String(message.dropFirst(3)))
        } else if message.hasPrefix("TRANSF") {
            let components = message.components(separatedBy: ":")
            return ("Transfer", String(components.last?.trimmingCharacters(in: CharacterSet(charactersIn: " ")) ?? ""))
        } else if message.hasPrefix("TARGETA") {
            //let components = message.components(separatedBy: " ")
            // return (components.first ?? "", components.dropFirst().joined(separator: " "))
            return (String(message.prefix(13)), String(message.dropFirst(14)))
        } else {
            return ("", message)
        }
    }

    override func create(filePath: String) -> AsyncThrowingStream<PartialBankTransaction, Error> {
        let stream = super.create(filePath: filePath)
        return AsyncThrowingStream { continuation in
            Task {
                do {
                    for try await var transaction in stream {
                        let (details, movementName) = self.splitMessage(transaction.movementName)
                        transaction.movementName = movementName
                        transaction.details = details
                        continuation.yield(transaction)
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
        }
    }
}

class CaixaEnginiersCreditImporter: CaixaEnginyersAbstractImporter {
    init() {
        let fieldsMap = FieldsMap<Int>(
            movementName: 3,
            date: 1,
            details: 4,
            value: 5
        )
        super.init(fieldsMap: fieldsMap, key: "caixa-enginyers/credit", fileRegex: "MovimientosTarjetaCredito.*\\.xls", skipAfterHeader: 3)
    }
}
