import Foundation

// Simple YAML parser for error codes (basic implementation)
struct ErrorDefinition {
    let message: String
    let additionalInfo: String?
}

struct ErrorConfig {
    let errors: [String: ErrorDefinition]
}

// Basic YAML parsing function for our new structure where root keys are error codes
func parseYAML(yamlString: String) -> ErrorConfig {
    var errors: [String: ErrorDefinition] = [:]

    let lines = yamlString.components(separatedBy: .newlines)
    var currentError: String?

    for line in lines {
        let trimmedLine = line.trimmingCharacters(in: .whitespaces)

        // Skip empty lines and comments
        if trimmedLine.isEmpty || trimmedLine.hasPrefix("#") {
            continue
        }

        // Look for error code sections (root level keys that don't have message/additional_info)
        if !line.hasPrefix(" ") && trimmedLine.contains(":") && !trimmedLine.contains("message:") && !trimmedLine.contains("additional_info:") {
            let parts = trimmedLine.components(separatedBy: ":")
            if parts.count > 0 {
                currentError = parts[0].trimmingCharacters(in: .whitespaces)
            }
        }
        // Look for message lines (2 spaces indent)
        else if line.hasPrefix("  message:") && line.count >= 2 {
            if let errorName = currentError {
                let messagePart = line.replacingOccurrences(of: "  message:", with: "").trimmingCharacters(in: .whitespaces)
                var message = messagePart
                if message.hasPrefix("\"") && message.hasSuffix("\"") {
                    message = String(message.dropFirst().dropLast())
                }
                // Get any existing additional info if we already have this error
                let existingAdditionalInfo = errors[errorName]?.additionalInfo
                errors[errorName] = ErrorDefinition(message: message, additionalInfo: existingAdditionalInfo)
            }
        }
        // Look for additional_info lines (2 spaces indent)
        else if line.hasPrefix("  additional_info:") && line.count >= 2 {
            if let errorName = currentError {
                let additionalInfoPart = line.replacingOccurrences(of: "  additional_info:", with: "").trimmingCharacters(in: .whitespaces)
                var additionalInfo = additionalInfoPart
                if additionalInfo.hasPrefix("\"") && additionalInfo.hasSuffix("\"") {
                    additionalInfo = String(additionalInfo.dropFirst().dropLast())
                }
                // Get any existing message if we already have this error
                let existingMessage = errors[errorName]?.message
                errors[errorName] = ErrorDefinition(message: existingMessage ?? "", additionalInfo: additionalInfo)
            }
        }
    }

    return ErrorConfig(errors: errors)
}

func generateErrorCodes(from config: ErrorConfig) -> String {
    var code = """
    // Generated file - do not edit manually
    // This file was auto-generated from error_codes.yaml

    import swift_exceptions

    public enum ErrorCodes: String, CaseIterable, Sendable, ErrorMsg {
    """
    
    for (codeName, _) in config.errors {
        code += "\n    case \(codeName)"
    }
    
    code += "\n\n    public var message: String {"
    code += "\n        switch self {"
    
    for (codeName, definition) in config.errors {
        code += "\n        case .\(codeName):"
        code += "\n            return \"\(definition.message.replacingOccurrences(of: "\"", with: "\\\""))\""
    }
    
    code += "\n        }"
    code += "\n    }"
    code += "\n}"
    
    return code
}

// Main execution
let args = CommandLine.arguments
let inputFile = args.count > 1 ? args[1] : "./error_codes.yaml"
let outputFile = args.count > 2 ? args[2] : "./generated/ErrorCodes.generated.swift"

do {
    let yamlString = try String(contentsOfFile: inputFile, encoding: .utf8)
    let config = parseYAML(yamlString: yamlString)
    
    // Create directory if it doesn't exist
    let outputDir = URL(fileURLWithPath: outputFile).deletingLastPathComponent().path
    try FileManager.default.createDirectory(atPath: outputDir, withIntermediateDirectories: true)
    
    let generatedCode = generateErrorCodes(from: config)
    try generatedCode.write(toFile: outputFile, atomically: true, encoding: .utf8)
    print("Successfully generated error codes to \(outputFile)")
} catch {
    print("Error: \(error)")
    exit(1)
}