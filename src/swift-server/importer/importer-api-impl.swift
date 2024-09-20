import OpenAPIRuntime
import OpenAPIVapor
import Foundation
import Vapor

let fileImporterService = FileImportService()

struct UploadData: Content {
    var kind: String
    var file: File
}

extension MrScroogeAPIImpl {
    
    func ApiImports_parserTypes(_ input: Operations.ApiImports_parserTypes.Input) async throws
        -> Operations.ApiImports_parserTypes.Output
    {
        let parserList = fileImporterService.getParsers()
        return .ok(.init(body: .json(.init(parsers: parserList.map({.init(name: $0.key, fileNameRegex: $0.fileRegex)})))))
        //return .undocumented(statusCode: 501, UndocumentedPayload())
    }

    func ApiImports_upload(_ input: Operations.ApiImports_upload.Input) async throws
        -> Operations.ApiImports_upload.Output
    {
        let upload = try request.content.decode(UploadData.self)
        
        /*var kind: String
        var fileUpload: HTTPBody
        switch input.body {
        case let .multipartForm(body):
            for try await part in body{
                switch part {
                case .kind(let _kind):
                    kind=_kind.payload
                case .file(let _file):
                    fileUpload=_file.payload.body
                case .undocumented(let undoc):
                    print(undoc)
                }
            }
            // upload = body
        }
        let upload : Components.Schemas.UploadDataMultiPart*/

        let tmpDir = NSTemporaryDirectory()
        let filePath =
            "\(tmpDir)/mr-scrooge-\(UUID().uuidString).\(upload.file.extension ?? "unknown")"
        // print(filePath)

        try await request.fileio.writeFile(upload.file.data, at: filePath)

        defer {
            do {
                try FileManager.default.removeItem(atPath: filePath)
            } catch {
                print(error)
            }
        }

        let user = try await getUser(fromRequest: request)

        let importData = try await fileImporterService.createFileImport(
            on: request.db, groupOwnerId: user.defaultGroup.requireID(), key: upload.kind,
            fileName: upload.file.filename, filePath: filePath)
        
        return .created(.init(body: .json(.init(file: importData))))
        /*let response = Response(status: .created)
        try response.content.encode(CreateImport(id: importId))

        return response*/
        // return .undocumented(statusCode: 501, UndocumentedPayload())
    }

    func ApiImports_list(_ input: Operations.ApiImports_list.Input) async throws
        -> Operations.ApiImports_list.Output
    {
        let user = try await getUser(fromRequest: request)
        let validGroupsId = try user.groups.map { return try $0.requireID() }
        let data = try await fileImporterService.getAll(
            on: request.db, groupIds: validGroupsId, cursor: input.query.cursor,
            limit: input.query.limit ?? 100)
        
        return .ok(.init(body: .json(.init(results: data.list.map{ .init(file: $0)}, next: data.next))))

    }
    
    func ApiImports_delete(_ input: Operations.ApiImports_delete.Input) async throws
        -> Operations.ApiImports_delete.Output
    {
        let user = try await getUser(fromRequest: request)
        let validGroupsId = try user.groups.map { return try $0.requireID() }
        let idString = input.path.id
        guard let importId = UUID(uuidString: idString) else {
            return .undocumented(statusCode: 400, UndocumentedPayload())
        }

        try await fileImporterService.delete(
            on: request.db, groupIds: validGroupsId, importId: importId)
        
        return .ok(.init(body: .json(.init(true))))
    }
    
}

extension Components.Schemas.FileImport {
    init(file: FileImportReport){
        id = file.id!.uuidString
        createdAt = file.createdAt
        description = file.description
        fileName = file.fileName
        groupOwnerId = file.groupOwnerId.uuidString
        kind = file.kind
        switch file.status{
        case .ok:
            status = .ok
        case .warn:
            status = .warning
        case .error:
            status = .error
        }
        context = file.context
        rows = file.rows.map{ row in
            return Components.Schemas.FileImportTransaction(
                movementName: row.movementName,
                date: row.date.toString(),
                dateValue: row.dateValue?.toString(),
                details: row.details,
                value: row.value,
                description: row.description,
                message: row.message,
                transactionId: row.transactionId?.uuidString
            )
        }
    }
}
