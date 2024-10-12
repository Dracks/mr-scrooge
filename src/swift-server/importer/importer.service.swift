import Fluent
import Vapor

class FileImportService {
	private let cursorHandler = CursorHandler<FileImportReport, String>(["created", "id"])
	private let uploadImportService = NewImportService(parsers: [
		CommerzBankEnImporter(), CaixaEnginiersCreditImporter(),
		CaixaEnginyersAccountImporter(), N26Importer(),
	])

	func getParsers() -> [ParserFactory] {
		return uploadImportService.getParsers()
	}

	func createFileImport(
		on db: Database, groupOwnerId: UUID, key: String, fileName: String, filePath: String
	) async throws -> FileImportReport {
		let importId = try await uploadImportService.importFromFile(
			on: db, groupOwnerId: groupOwnerId, key: key, fileName: fileName,
			filePath: filePath)
		let importReport = try await FileImportReport.query(on: db).filter(
			\.$id == importId
		).with(\.$rows).first()
		return importReport!
	}

	func getAll(on db: Database, groupIds: [UUID], cursor: String? = nil, limit: Int = 100)
		async throws -> ListWithCursor<FileImportReport>
	{
		var query = FileImportReport.query(on: db)
			.filter(\.$groupOwnerId ~~ groupIds)
			.limit(limit)
			.sort(\.$createdAt, .descending)
			.sort(\.$id, .descending)
			.with(\.$rows)

		if let cursor = cursor {
			let cursorData = try self.cursorHandler.parse(cursor)
			if let dateString = cursorData["created"],
				let date = Date(rfc1123: dateString),
				let idString = cursorData["id"], let id = UUID(uuidString: idString)
			{
				query = query.group(.or) { group in
					group.group(.and) { subGroup in
						subGroup.filter(\.$createdAt == date)
							.filter(\.$id < id)
					}
					group.filter(\.$createdAt < date)
				}
				print(query)
			}
		}

		let reports = try await query.all()

		let lastElement = reports.count >= limit ? reports.last : nil
		let nextCursor = lastElement.flatMap {
			cursorHandler.stringify(["id": $0.id?.uuidString ?? ""])
		}

		return ListWithCursor(
			list: reports,
			next: nextCursor
		)
	}

	func delete(on db: Database, groupIds: [UUID], importId: UUID) async throws {
		let exists = try await FileImportReport.query(on: db).filter(\.$id == importId)
			.filter(
				\.$groupOwnerId ~~ groupIds
			).count()
		if exists > 0 {
			try await FileImportRow.query(on: db).filter(\.$report.$id == importId)
				.delete()
			try await FileImportReport.query(on: db).filter(\.$id == importId).delete()
		}

	}
}
