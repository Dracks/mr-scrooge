import Fluent
import Vapor

struct ImporterController: RouteCollection {
	func boot(routes: RoutesBuilder) throws {
		let importers = routes.grouped("import")
		importers.post("upload", use: uploadFile)
	}

	func uploadFile(req: Request) async throws -> HTTPStatus {
		struct UploadData: Content {
			var kind: String
			var file: File
		}

		let upload = try req.content.decode(UploadData.self)
		print(upload)

		/*guard let fileData = upload.file.data else {
            throw Abort(.badRequest, reason: "No file data")
        }

        // TODO: Process the file based on the 'kind' parameter
        // For example:
        switch upload.kind {
        case "bankStatement":
            // Process bank statement
            print("Processing bank statement")
        case "invoice":
            // Process invoice
            print("Processing invoice")
        default:
            throw Abort(.badRequest, reason: "Invalid file kind")
        }*/

		// TODO: Save the processed data to the database

		return .ok
	}
}
