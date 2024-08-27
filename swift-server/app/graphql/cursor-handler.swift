import Vapor

class CursorHandler<T, R: Hashable> {
    let fields: [R]

    init(_ fields: [R]) {
        self.fields = fields
    }

    func parse(_ cursor: String) throws -> [R: String] {
        let data = cursor.split(separator: ":")
        var result: [R: String] = [:]
        for (index, item) in data.enumerated() {
            guard let field = fields[safe: index] else {
                throw Abort(.badRequest, reason: "Invalid cursor: \(cursor)")
            }
            result[field] = String(item)
        }
        return result
    }

    func stringify(_ data: [R: String]) -> String {
        return fields.compactMap { data[$0] }.joined(separator: ":")
    }
}
