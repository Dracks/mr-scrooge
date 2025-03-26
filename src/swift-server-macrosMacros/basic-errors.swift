import SwiftSyntax
import SwiftSyntaxMacros

enum CustomError: Error {
	case message(String)
}

public struct BasicBadRequest: ExpressionMacro {
	public static func expansion(
		of node: some SwiftSyntax.FreestandingMacroExpansionSyntax,
		in context: some SwiftSyntaxMacros.MacroExpansionContext
	) throws -> ExprSyntax {
		guard
			let message = node.arguments.first?.expression.as(
				StringLiteralExprSyntax.self)?.representedLiteralValue
		else {
			throw CustomError.message("First parameter should be an string")
		}

		guard
			let expression = node.arguments.dropFirst().first?.expression.as(
				MemberAccessExprSyntax.self)
		else {
			throw CustomError.message("Invalid code")
		}
		let text = expression.declName.baseName.text
		return """
					.badRequest(
						.init(
							body: .json(
								.init(
									message: "\(raw: message)",
									code: "\(raw: text)"))))
			"""
	}
}

public struct BasicNotFound: ExpressionMacro {
	public static func expansion(
		of node: some SwiftSyntax.FreestandingMacroExpansionSyntax,
		in context: some SwiftSyntaxMacros.MacroExpansionContext
	) throws -> ExprSyntax {
		guard
			let message = node.arguments.first?.expression.as(
				StringLiteralExprSyntax.self)?.representedLiteralValue
		else {
			throw CustomError.message("First parameter should be an string")
		}

		guard
			let expression = node.arguments.dropFirst().first?.expression.as(
				MemberAccessExprSyntax.self)
		else {
			throw CustomError.message("Invalid code")
		}
		let text = expression.declName.baseName.text
		return """
					.notFound(
						.init(
							body: .json(
								.init(
									message: "\(raw: message)",
									code: "\(raw: text)"))))
			"""
	}
}

public struct GenericErrorReturn: ExpressionMacro {
	public static func expansion(
		of node: some SwiftSyntax.FreestandingMacroExpansionSyntax,
		in context: some SwiftSyntaxMacros.MacroExpansionContext
	) throws -> ExprSyntax {
		guard
			let response = node.arguments.first?.expression.as(
				StringLiteralExprSyntax.self)?.representedLiteralValue
		else {
			throw CustomError.message("First parameter should be an string")
		}

		guard
			let message = node.arguments.dropFirst().first?.expression.as(
				StringLiteralExprSyntax.self)?.representedLiteralValue
		else {
			throw CustomError.message("Second parameter should be an string")
		}

		guard
			let expression = node.arguments.dropFirst().dropFirst().first?.expression
				.as(
					MemberAccessExprSyntax.self)
		else {
			throw CustomError.message("Invalid code")
		}
		let text = expression.declName.baseName.text
		return """
					.\(raw: response)(
						.init(
							body: .json(
								.init(
									message: "\(raw: message)",
									code: "\(raw: text)"))))
			"""
	}
}
