import Foundation
import OpenAPIRuntime
import OpenAPIVapor
import Vapor

struct UploadData: Content {
	var kind: String
	var file: File
}

extension MrScroogeAPIImpl {

	func ApiImports_parserTypes(_ input: Operations.ApiImports_parserTypes.Input) async throws
		-> Operations.ApiImports_parserTypes.Output
	{
		let fileImportService = request.application.fileImportService
		let parserList = fileImportService.getParsers()
		return .ok(
			.init(
				body: .json(
					.init(
						parsers: parserList.map({
							.init(
								name: $0.key,
								fileNameRegex: $0.fileRegex)
						})))))
	}

	/*func ApiImports_upload(_ input: Operations.ApiImports_upload.Input) async throws
		-> Operations.ApiImports_upload.Output
	{
		return .undocumented(statusCode: 501, UndocumentedPayload())
	}*/

	func ApiImports_list(_ input: Operations.ApiImports_list.Input) async throws
		-> Operations.ApiImports_list.Output
	{
		let fileImportService = request.application.fileImportService
		let user = try await getUser(fromRequest: request)
		let validGroupsId = try user.groups.map { return try $0.requireID() }
		let data = try await fileImportService.getAll(
			groupIds: validGroupsId, cursor: input.query.cursor,
			limit: input.query.limit ?? 100)

		return .ok(
			.init(
				body: .json(
					.init(
						results: data.list.map { .init(file: $0) },
						next: data.next))))

	}

	func ApiImports_delete(_ input: Operations.ApiImports_delete.Input) async throws
		-> Operations.ApiImports_delete.Output
	{
		let fileImportService = request.application.fileImportService
		let user = try await getUser(fromRequest: request)
		let validGroupsId = try user.groups.map { return try $0.requireID() }
		let idString = input.path.id
		guard let importId = UUID(uuidString: idString) else {
			return .undocumented(statusCode: 400, UndocumentedPayload())
		}

		try await fileImportService.delete(
			groupIds: validGroupsId, importId: importId)

		return .ok(.init(body: .plainText("true")))
	}

}

struct ImportUpload: RouteCollection {
	func boot(routes: RoutesBuilder) throws {
		routes.grouped("api").post("imports", use: uploadFile)
	}

	func uploadFile(request: Request) async throws -> Response {

		let upload = try request.content.decode(UploadData.self)
		let fileImportService = request.application.fileImportService

		let tmpDir = NSTemporaryDirectory()
		let filePath =
			"\(tmpDir)/mr-scrooge-\(UUID().uuidString).\(upload.file.extension ?? "unknown")"

		try await request.fileio.writeFile(upload.file.data, at: filePath)

		defer {
			do {
				try FileManager.default.removeItem(atPath: filePath)
			} catch {
				request.application.logger.warning(
					"Cannot delete a file after processing",
					metadata: ["error": "\(String(reflecting: error))"])
			}
		}

		let user = try await getUser(fromRequest: request)

		let importData = try await fileImportService.createFileImport(
			groupOwnerId: user.defaultGroup.requireID(),
			key: upload.kind,
			fileName: upload.file.filename, filePath: filePath)

		// return UploadImportResponse()
		let openApiMod = Components.Schemas.FileImport(file: importData)
		return try await openApiMod.encodeResponse(status: .created, for: request)

	}
}

extension Components.Schemas.FileImport: Content {
	init(file: FileImportReport) {
		id = file.id!.uuidString
		createdAt = file.createdAt ?? Date()
		description = file.description
		fileName = file.fileName
		groupOwnerId = file.groupOwnerId.uuidString
		kind = file.kind
		switch file.status {
		case .ok:
			status = .ok
		case .warn:
			status = .warning
		case .error:
			status = .error
		}
		context = file.context
		rows = file.rows.map { row in
			return Components.Schemas.FileImportTransaction(
				movementName: row.movementName,
				date: row.date.toString(),
				dateValue: row.dateValue?.toString(),
				details: row.details,
				value: row.value,
				description: row.description,
				message: row.message,
				transactionId: row.$transaction.id?.uuidString
			)
		}
	}
}
