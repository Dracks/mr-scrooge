import Foundation
import PackagePlugin

@main
struct GenerateErrorCodes: BuildToolPlugin {
	func createBuildCommands(context: PackagePlugin.PluginContext, target: PackagePlugin.Target)
		async throws -> [PackagePlugin.Command]
	{
		// Usar URL en lloc de Path
		let inputJSON = target.directoryURL.appending(path: "error_codes.yaml")
		let output = context.pluginWorkDirectoryURL.appending(path: "ErrorCodes.swift")

		return [
			.buildCommand(
				displayName: "Generate Error Codes",
				executable: try context.tool(named: "ErrorCodesGenerator").url,
				arguments: [inputJSON.path(), output.path()],
				environment: [:],
				inputFiles: [inputJSON],
				outputFiles: [output])
		]
	}
}
