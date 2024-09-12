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

	class Schema: PartialSchema<MrScroogeResolver, Request> {
		@TypeDefinitions
		override var types: Types {
			Type(ImportKind.self) {
				Field("name", at: \.name)
				Field("regex", at: \.regex)
			}
		}

		@FieldDefinitions
		override var query: Fields {
			Field("importKinds", at: MrScroogeResolver.importKinds)
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
}
