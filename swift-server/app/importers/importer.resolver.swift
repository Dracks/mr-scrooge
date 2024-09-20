import Graphiti
import Vapor
/*
class ImporterTypes {
	static let importerService = NewImportService(parsers: [
		N26Importer(),
		CommerzBankEnImporter(),
		CaixaEnginiersCreditImporter(),
		CaixaEnginyersAccountImporter(),
	])
	static let statusReportsService = StatusReportsService()
	struct ImportKind: Codable {
		let name: String
		let regex: String
	}

	struct GqlImport: Codable {
		let id: UUID
		let createdAt: Date
		let description: String
		let fileName: String
		let groupOwnerId: UUID
		let kind: String
		let status: StatusReportStatus
		let context: String?
		let rows: [GqlImportRow]
	}

	struct GqlImportRow: Codable {
		let movementName: String
		let date: DateOnly
		let dateValue: DateOnly?
		let details: String?
		let value: Double
		let description: String?
		let message: String?
		let transactionId: UUID?
	}

	struct GetImportsArgs: Codable {
		let cursor: String?
		let limit: Int?
	}

	struct GetImports: Codable, GetImportsResponse {
		let results: [GqlImport]
		let next: String?
	}

	protocol GetImportsResponse {

	}

	struct DeleteImportArgs: Codable {
		let id: UUID
	}

	struct DeleteImport: DeleteImportResponse {
		let ok: Bool
	}

	protocol DeleteImportResponse {}

	class Schema: PartialSchema<MrScroogeResolver, Request> {
		@TypeDefinitions
		override var types: Types {
			Type(ImportKind.self) {
				Field("name", at: \.name)
				Field("regex", at: \.regex)
			}

			Type(GqlImportRow.self) {
				Field("movementName", at: \.movementName)
				Field("date", at: \.date)
				Field("dateValue", at: \.dateValue)
				Field("details", at: \.details)
				Field("value", at: \.value)
				Field("description", at: \.description)
				Field("message", at: \.message)
				Field("transactionId", at: \.transactionId)
			}

			Type(GqlImport.self) {
				Field("id", at: \.id)
				Field("createdAt", at: \.createdAt)
				Field("description", at: \.description)
				Field("fileName", at: \.fileName)
				Field("groupOwnerId", at: \.groupOwnerId)
				Field("kind", at: \.kind)
				Field("status", at: \.status)
				Field("context", at: \.context)
				Field("rows", at: \.rows)
			}

			Enum(StatusReportStatus.self, as: "ImportStatus") {
				Value(.ok)
				Value(.warn)
				Value(.error)
			}

			Type(GetImports.self) {
				Field("results", at: \.results)
				Field("next", at: \.next)
			}

			Union(GetImportsResponse.self, members: GetImports.self)

			Type(DeleteImport.self){
				Field("ok", at: \.ok)
			}
			Union(DeleteImportResponse.self, members: DeleteImport.self)
		}

		@FieldDefinitions
		override var query: Fields {
			Field("importKinds", at: MrScroogeResolver.importKinds)
			Field("imports", at: MrScroogeResolver.imports) {
				Argument("cursor", at: \.cursor)
				Argument("limit", at: \.limit)
			}
		}

		@FieldDefinitions
		override var mutation: Fields {
			Field("deleteImport", at: MrScroogeResolver.deleteImport){
				Argument("id", at: \.id)
			}
		}
	}
}

extension MrScroogeResolver {

	func importKinds(req: Request, arguments: NoArguments) -> [ImporterTypes.ImportKind] {
		let parsers: [ParserFactory] = ImporterTypes.importerService.getParsers()
		return parsers.map { parser in
			ImporterTypes.ImportKind(
				name: parser.key, regex: parser.fileRegex.description)
		}
	}

	func imports(req: Request, arguments: ImporterTypes.GetImportsArgs) async throws
		-> ImporterTypes.GetImportsResponse
	{
		let user = try await getUser(fromRequest: req)
		let validGroupsId = try user.groups.map { return try $0.requireID() }
		let data = try await ImporterTypes.statusReportsService.getAll(
			on: req.db, groupIds: validGroupsId, cursor: arguments.cursor,
			limit: arguments.limit ?? 100)

		return ImporterTypes.GetImports(
			results: data.list.map({ status in
				return ImporterTypes.GqlImport(
					id: status.id!,
					createdAt: status.createdAt,
					description: status.description,
					fileName: status.fileName,
					groupOwnerId: status.groupOwnerId,
					kind: status.kind,
					status: status.status,
					context: status.context,
					rows: status.rows.map({
						ImporterTypes.GqlImportRow(
							movementName: $0.movementName,
							date: $0.date, dateValue: $0.dateValue,
							details: $0.details, value: $0.value,
							description: $0.description,
							message: $0.message,
							transactionId: $0.transactionId)
					}))
			}), next: data.next)
	}

	func deleteImport(req: Request, arguments: ImporterTypes.DeleteImportArgs) async throws -> ImporterTypes.DeleteImportResponse {
		let user = try await getUser(fromRequest: req)
		let validGroupsId = try user.groups.map { return try $0.requireID() }

		try await ImporterTypes.statusReportsService.delete(on: req.db, groupIds: validGroupsId, importId: arguments.id)

		return ImporterTypes.DeleteImport(ok: true)
	}
}
*/
