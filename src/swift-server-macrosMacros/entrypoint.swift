import Foundation
import SwiftCompilerPlugin
import SwiftDiagnostics
import SwiftSyntax
import SwiftSyntaxBuilder
import SwiftSyntaxMacros

@main
struct swift_macrosPlugin: CompilerPlugin {
	let providingMacros: [Macro.Type] = [
		ServiceDependencyMacro.self,
		BasicBadRequest.self,
		BasicNotFound.self,
		GenericErrorReturn.self,
	]
}
