import Foundation
import Yams

// Simple YAML parser for error codes (basic implementation)
struct ErrorDefinition: Decodable {
	let message: String
	let additionalInfo: String?

	enum CodingKeys: String, CodingKey {
		case message = "message"
		case additionalInfo = "additional_info"
	}
}

struct Exception: Error {
	let message: String
}

func generateErrorCodes(from errors: [String: ErrorDefinition]) -> String {
	var code = """
		// Generated file - do not edit manually
		// This file was auto-generated from error_codes.yaml

		import Exceptions

		public enum ErrorCodes: String, CaseIterable, Sendable, ErrorMsg {
		"""
	let errors = errors.enumerated().map { $1 }.sorted(by: { $0.key < $1.key })

	for (codeName, _) in errors {
		code += "\n    case \(codeName)"
	}

	code += "\n\n    public var message: String {"
	code += "\n        switch self {"

	for (codeName, definition) in errors {
		code += "\n        case .\(codeName):"
		code +=
			"\n            return \"\(definition.message.replacingOccurrences(of: "\"", with: "\\\""))\""
	}

	code += "\n        }"
	code += "\n    }"

	code += "\n\n    public var additionalInfo: String? {"
	code += "\n        switch self {"

	for (codeName, definition) in errors {
		code += "\n        case .\(codeName):"
		if let additionalInfo = definition.additionalInfo {
			code +=
				"\n            return \"\(additionalInfo.replacingOccurrences(of: "\"", with: "\\\""))\""
		} else {
			code += "\n            return nil"
		}
	}

	code += "\n        }"
	code += "\n    }"
	code += "\n}"

	return code
}
do {
	// Main execution
	let args = CommandLine.arguments
	guard args.count >= 3 else {
		throw Exception(message: "Usage: \(args[0]) <source.yaml> <dest.swift>")
	}
	let inputFile = args[1]
	let outputFile = args[2]

	let yamlString = try String(contentsOfFile: inputFile, encoding: .utf8)
	let decoder = YAMLDecoder()
	let decoded = try decoder.decode(
		[String: ErrorDefinition].self, from: yamlString)

	// Create directory if it doesn't exist
	let outputDir = URL(fileURLWithPath: outputFile).deletingLastPathComponent().path
	try FileManager.default.createDirectory(
		atPath: outputDir, withIntermediateDirectories: true)

	let generatedCode = generateErrorCodes(from: decoded)
	try generatedCode.write(toFile: outputFile, atomically: true, encoding: .utf8)
	print("Successfully generated error codes to \(outputFile)")
} catch {
	print("Error: \(error)")
	exit(1)
}
