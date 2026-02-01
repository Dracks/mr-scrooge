import Foundation

// Simple YAML parser for error codes (basic implementation)
struct ErrorDefinition {
    let message: String
    let additionalInfo: String?
}

struct ErrorConfig {
    let errors: [String: ErrorDefinition]
}

// Basic YAML parsing function for our structure where root keys are error codes
func parseYAML(yamlString: String) -> ErrorConfig {
    var errors: [String: ErrorDefinition] = [:]
    
    let lines = yamlString.components(separatedBy: .newlines)
    var currentError: String?
    var currentMessage: String?
    var currentAdditionalInfo: String?

    for line in lines {
        let trimmedLine = line.trimmingCharacters(in: .whitespaces)

        // Skip empty lines and comments
        if trimmedLine.isEmpty || trimmedLine.hasPrefix("#") {
            continue
        }

        // Look for error code sections (root level keys)
        if !line.hasPrefix(" ") && trimmedLine.contains(":") && !trimmedLine.contains("message:") && !trimmedLine.contains("additional_info:") {
            // If we were processing a previous error, save it
            if let prevError = currentError, let prevMessage = currentMessage {
                errors[prevError] = ErrorDefinition(message: prevMessage, additionalInfo: currentAdditionalInfo)
            }
            
            // Start a new error
            currentError = trimmedLine.replacingOccurrences(of: ":", with: "").trimmingCharacters(in: .whitespaces)
            currentMessage = nil
            currentAdditionalInfo = nil
        }
        // Look for message lines (2 spaces indent)
        else if line.hasPrefix("  message:") {
            if let errorName = currentError {
                let messagePart = line.replacingOccurrences(of: "  message:", with: "").trimmingCharacters(in: .whitespaces)
                var message = messagePart
                if message.hasPrefix("\"") && message.hasSuffix("\"") {
                    message = String(message.dropFirst().dropLast())
                }
                currentMessage = message
            }
        }
        // Look for additional_info lines (2 spaces indent)
        else if line.hasPrefix("  additional_info:") {
            if let errorName = currentError {
                let additionalInfoPart = line.replacingOccurrences(of: "  additional_info:", with: "").trimmingCharacters(in: .whitespaces)
                var additionalInfo = additionalInfoPart
                if additionalInfo.hasPrefix("\"") && additionalInfo.hasSuffix("\"") {
                    additionalInfo = String(additionalInfo.dropFirst().dropLast())
                }
                currentAdditionalInfo = additionalInfo
            }
        }
    }
    
    // Don't forget the last error
    if let prevError = currentError, let prevMessage = currentMessage {
        errors[prevError] = ErrorDefinition(message: prevMessage, additionalInfo: currentAdditionalInfo)
    }

    return ErrorConfig(errors: errors)
}

func generateErrorCodes(from config: ErrorConfig) -> String {
    var code = """
    // Generated file - do not edit manually
    // This file was auto-generated from error_codes.yaml

    import Exceptions

    public enum ErrorCodes: String, CaseIterable, Sendable, ErrorMsg {
    """

    for (codeName, _) in config.errors.sorted(by: { $0.key < $1.key }) {
        code += "\n    case \(codeName)"
    }

    code += "\n\n    public var message: String {"
    code += "\n        switch self {"

    for (codeName, definition) in config.errors.sorted(by: { $0.key < $1.key }) {
        code += "\n        case .\(codeName):"
        code += "\n            return \"\(definition.message.replacingOccurrences(of: "\"", with: "\\\""))\""
    }

    code += "\n        }"
    code += "\n    }"
    
    code += "\n\n    public var additionalInfo: String? {"
    code += "\n        switch self {"
    
    for (codeName, definition) in config.errors.sorted(by: { $0.key < $1.key }) {
        code += "\n        case .\(codeName):"
        if let additionalInfo = definition.additionalInfo {
            code += "\n            return \"\(additionalInfo.replacingOccurrences(of: "\"", with: "\\\""))\""
        } else {
            code += "\n            return nil"
        }
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