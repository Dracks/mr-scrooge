// swift-tools-version: 5.9
import PackagePlugin
import Foundation

@main
struct GenerateErrorCodesPlugin: BuildToolPlugin {
    func createBuildCommands(context: PluginContext, target: Target) async throws -> [Command] {
        // Only process the MrSGocardless target for now
        guard target.name == "MrSGocardless" else {
            print("Skipping error code generation for target: \(target.name)")
            return []
        }

        // Use the generate_errors.swift script in the codegen directory
        let scriptPath = context.package.directory.appending(subpath: "src/codegen/main.swift")

        // Look for error_codes.yaml in the target's directory first, fallback to swift-gocardless
        let inputPath = context.package.directory.appending(subpath: "src/swift-server/error_codes.yaml")

        // Check if the error_codes.yaml file exists before creating the build command
        guard FileManager.default.fileExists(atPath: inputPath.string) else {
            print("Warning: error_codes.yaml not found at \(inputPath.string), skipping error code generation for \(target.name)")
            return [] // Return an empty array if the file doesn't exist
        }

        let outputPath = context.pluginWorkDirectory.appending(subpath: "ErrorCodes.generated.swift")

        // Create the command to run the script with swift
        return [
            .buildCommand(
                displayName: "Generate Error Codes for \(target.name)",
                executable: try context.tool(named: "swift").path,
                arguments: [
                    scriptPath.string,
                    inputPath.string,
                    outputPath.string
                ],
                inputFiles: [inputPath],
                outputFiles: [outputPath]
            )
        ]
    }
}