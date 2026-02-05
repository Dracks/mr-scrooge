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
		guard let responseArg = node.arguments.first?.expression else {
			throw CustomError.message("First parameter should be a string")
		}

		guard let messageArg = node.arguments.dropFirst().first?.expression else {
			throw CustomError.message("Second parameter should be a string")
		}

		guard
			let expression = node.arguments.dropFirst().dropFirst().first?.expression
				.as(MemberAccessExprSyntax.self)
		else {
			throw CustomError.message("Invalid code")
		}

		let text = expression.declName.baseName.text

		// Handle response parameter (should always be a string literal for the enum case name)
		let responseValue =
			responseArg.as(StringLiteralExprSyntax.self)?.representedLiteralValue
			?? responseArg.description.trimmingCharacters(in: .whitespacesAndNewlines)

		// Normalize responseValue to strip leading dots and type qualifiers
		// This prevents double-dots when responseArg is a member access like ".badRequest" or "Response.badRequest"
		var normalizedResponseValue = responseValue
		// Remove leading dot if present
		if normalizedResponseValue.hasPrefix(".") {
			normalizedResponseValue = String(normalizedResponseValue.dropFirst())
		}
		// Remove type qualifier prefix like "Response." (identifier followed by dot)
		// Split by the last dot to get the type qualifier and the actual member name
		if let lastDotIndex = normalizedResponseValue.lastIndex(of: ".") {
			// Keep only the part after the last dot (the actual member name)
			normalizedResponseValue = String(normalizedResponseValue.suffix(from: normalizedResponseValue.index(after: lastDotIndex)))
		}

		// Handle message parameter - check if it's a string literal or variable
		if let messageLiteral = messageArg.as(StringLiteralExprSyntax.self) {
			// If it's a string literal, use it with quotes
			let messageText = messageLiteral.representedLiteralValue ?? ""
			return """
						.\(raw: normalizedResponseValue)(
							.init(
								body: .json(
									.init(
										message: "\(raw: messageText)",
										code: "\(raw: text)"))))
				"""
		} else {
			// If it's a variable/expression, use it directly
			return """
						.\(raw: normalizedResponseValue)(
							.init(
								body: .json(
									.init(
										message: \(messageArg),
										code: "\(raw: text)"))))
				"""
		}
	}
}
