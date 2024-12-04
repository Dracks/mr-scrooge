import Foundation
import SwiftCompilerPlugin
import SwiftDiagnostics
import SwiftSyntax
import SwiftSyntaxBuilder
import SwiftSyntaxMacros


public struct ServiceDependencyMacro: AccessorMacro {

	public static func expansion(
		of node: SwiftSyntax.AttributeSyntax,
		providingAccessorsOf declaration: some SwiftSyntax.DeclSyntaxProtocol,
		in context: some SwiftSyntaxMacros.MacroExpansionContext
	) throws -> [SwiftSyntax.AccessorDeclSyntax] {
		guard let varDecl = declaration.as(VariableDeclSyntax.self) else {
			let invalidUsageErr = Diagnostic(
				node: node.root,
				message: MacroExpansionErrorMessage("Invalid declaration"))
			context.diagnose(invalidUsageErr)
			return []
		}

		guard let nodeType = varDecl.bindings.first?.typeAnnotation?.type else {
			let missingAnnotationErr = Diagnostic(
				node: node.root, message: MacroExpansionErrorMessage("Missing anotation"))
			context.diagnose(missingAnnotationErr)
			return []
		}
		return [
			"""
			            get {
			                guard let service = self.storage[\(nodeType).self] else {
			                    let newService = \(nodeType)(app: self)
			                    self.storage[\(nodeType).self] = newService
			                    return newService
			                }
			                return service
			            }
			""",
			"""
			            set {
			                self.storage[\(nodeType).self] = newValue
			            }
			""",
		]
	}

}
