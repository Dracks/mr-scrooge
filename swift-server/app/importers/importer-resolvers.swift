import Graphiti
import Vapor

class ImporterTypes {
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
		let parsers: [ParserFactory] = []
		return parsers.map { parser in
			ImporterTypes.ImportKind(
				name: parser.key, regex: parser.fileRegex.description)
		}
	}
}
