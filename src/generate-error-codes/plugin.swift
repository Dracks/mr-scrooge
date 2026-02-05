import Foundation
// swift-tools-version: 5.9
import PackagePlugin

@main
struct GenerateErrorCodes: BuildToolPlugin {
	func createBuildCommands(context: PackagePlugin.PluginContext, target: PackagePlugin.Target)
		async throws -> [PackagePlugin.Command]
	{

		let inputJSON = target.directory.appending("error_codes.yaml")
		let output = context.pluginWorkDirectory.appending("ErrorCodes.swift")
		return [
			.buildCommand(
				displayName: "Generate Error Codes",
				executable: try context.tool(named: "ErrorCodesGenerator").path,
				arguments: [inputJSON, output],
				environment: [:],
				inputFiles: [inputJSON],
				outputFiles: [output])
		]
	}
}
