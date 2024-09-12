import Graphiti
import Vapor

class ImporterTypes {
	static let importerService = NewImportService(parsers: [
		N26Importer(),
		CommerzBankEnImporter(),
		CaixaEnginiersCreditImporter(),
		CaixaEnginyersAccountImporter(),
	])
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
            
            Type(GetImports.self){
                Field("results", at: \.results)
                Field("next", at: \.next)
            }

			Union(GetImportsResponse.self, members: GetImports.self)
		}

		@FieldDefinitions
		override var query: Fields {
			Field("importKinds", at: MrScroogeResolver.importKinds)
            Field("imports", at: MrScroogeResolver.imports) {
                Argument("cursor", at: \.cursor)
                Argument("limit", at: \.limit)
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
    
    func imports(req: Request, arguments: ImporterTypes.GetImportsArgs) throws -> ImporterTypes.GetImportsResponse {
        throw Abort(.internalServerError)
    }
}
