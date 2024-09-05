import Fluent
import Vapor

class StatusReportsService {
    private let cursorHandler = CursorHandler<StatusReport, String>(["id"])

    func getAll(on db: Database, groupIds: [UUID], cursor: String? = nil, limit: Int = 100) async throws -> ListWithCursor<StatusReport> {
        var query = StatusReport.query(on: db)
            .filter(\.$groupOwnerId ~~ groupIds)
            .limit(limit)
            .sort(\.$id, .descending)

        if let cursor = cursor,
           let cursorData = try? cursorHandler.parse(cursor), let idString = cursorData["id"], let id = UUID(uuidString: idString) {
            query = query.filter(\.$id < id)
        }

        let reports = try await query.all()

        let lastElement = reports.count >= limit ? reports.last : nil
        let nextCursor = lastElement.flatMap { cursorHandler.stringify(["id": $0.id?.uuidString ?? "" ]) }

        return ListWithCursor(
            list: reports,
            next: nextCursor
        )
    }
}
