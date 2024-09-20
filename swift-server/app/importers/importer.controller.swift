import Fluent
import Foundation
import Vapor

struct ImporterController: RouteCollection {
	let importerService = NewImportService(parsers: [
		N26Importer(),
		CommerzBankEnImporter(),
		CaixaEnginiersCreditImporter(),
		CaixaEnginyersAccountImporter(),
	])
	let statusReportsService = StatusReportsService()

	struct UploadData: Content {
		var kind: String
		var file: File
	}

	struct CreateImport: Content {
		var id: UUID
	}
	struct ImportKind: Content {
		let name: String
		let regex: String
	}

	struct Import: Content {
		let id: UUID
		let createdAt: Date
		let description: String
		let fileName: String
		let groupOwnerId: UUID
		let kind: String
		let status: StatusReportStatus
		let context: String?
		let rows: [ImportRow]
	}

	struct ImportRow: Content {
		let movementName: String
		let date: String
		let dateValue: String?
		let details: String?
		let value: Double
		let description: String?
		let message: String?
		let transactionId: UUID?
	}

	struct GetImportsParams: Content {
		let cursor: String?
		let limit: Int?
	}

	struct GetImports: Content {
		let results: [Import]
		let next: String?
	}

	struct GetImportKinds: Content {
		let results: [ImportKind]
	}

	struct DeleteImport: Content {
		let ok: Bool
	}

	func boot(routes: RoutesBuilder) throws {
		let importers = routes.grouped(UserIdentifiedMiddleware()).grouped("import")
		importers.post("upload", use: uploadFile)
		importers.get("kinds", use: getImportKinds)
		importers.get(use: getImports)
		importers.delete(":id", use: deleteImport)
	}

	func uploadFile(req: Request) async throws -> Response {
		let upload = try req.content.decode(UploadData.self)

		let tmpDir = NSTemporaryDirectory()
		let filePath =
			"\(tmpDir)/mr-scrooge-\(UUID().uuidString).\(upload.file.extension ?? "unknown")"
		// print(filePath)

		try await req.fileio.writeFile(upload.file.data, at: filePath)

		defer {
			do {
				try FileManager.default.removeItem(atPath: filePath)
			} catch {
				print(error)
			}
		}

		let user = try await getUser(fromRequest: req)

		let importId = try await importerService.importFromFile(
			on: req.db, groupOwnerId: user.defaultGroup.requireID(), key: upload.kind,
			fileName: upload.file.filename, filePath: filePath)
		let response = Response(status: .created)
		try response.content.encode(CreateImport(id: importId))

		return response
	}

	func getImportKinds(req: Request) async throws -> GetImportKinds {
		let parsers: [ParserFactory] = importerService.getParsers()
		return GetImportKinds(
			results: parsers.map { parser in
				return ImportKind(
					name: parser.key, regex: parser.fileRegex.description)

			})
	}

	func getImports(req: Request) async throws -> GetImports {
		let user = try await getUser(fromRequest: req)
		let validGroupsId = try user.groups.map { return try $0.requireID() }
		let data = try await statusReportsService.getAll(
			on: req.db, groupIds: validGroupsId, cursor: req.query["cursor"],
			limit: req.query["limit"] ?? 100)

		return GetImports(
			results: data.list.map({ status in
				return Import(
					id: status.id!,
					createdAt: status.createdAt,
					description: status.description,
					fileName: status.fileName,
					groupOwnerId: status.groupOwnerId,
					kind: status.kind,
					status: status.status,
					context: status.context,
					rows: status.rows.map({
						ImportRow(
							movementName: $0.movementName,
							date: $0.date.toString(),
							dateValue: $0.dateValue?.toString(),
							details: $0.details, value: $0.value,
							description: $0.description,
							message: $0.message,
							transactionId: $0.transactionId)
					}))
			}), next: data.next)
	}

	func deleteImport(req: Request) async throws -> DeleteImport {
		let user = try await getUser(fromRequest: req)
		let validGroupsId = try user.groups.map { return try $0.requireID() }
		let idString = req.parameters.get("id")
		guard let idString = idString, let importId = UUID(uuidString: idString) else {
			throw Abort(.badRequest)
		}

		try await statusReportsService.delete(
			on: req.db, groupIds: validGroupsId, importId: importId)

		return DeleteImport(ok: true)
	}
}
