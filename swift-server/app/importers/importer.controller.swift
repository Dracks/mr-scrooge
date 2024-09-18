import Fluent
import Foundation
import Vapor

struct ImporterController: RouteCollection {
	struct UploadData: Content {
		var kind: String
		var file: File
	}

	struct CreateImport: Content {
		var id: UUID
	}

	func boot(routes: RoutesBuilder) throws {
		let importers = routes.grouped(UserIdentifiedMiddleware()).grouped("import")
		importers.post("upload", use: uploadFile)
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

		let importId = try await ImporterTypes.importerService.importFromFile(
			on: req.db, groupOwnerId: user.defaultGroup.requireID(), key: upload.kind,
			fileName: upload.file.filename, filePath: filePath)
		let response = Response(status: .created)
		try response.content.encode(CreateImport(id: importId))


		//return .init(status: .created, content: CreateImport(id: importId))
		return response

	}
}
