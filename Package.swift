// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import CompilerPluginSupport
import PackageDescription

let package = Package(
	name: "mr-scrooge",
	platforms: [
		.macOS(.v13)
	],
	dependencies: [
		// Vapor
		.package(url: "https://github.com/vapor/vapor", from: "4.112.0"),

		// 🔵 Non-blocking, event-driven networking for Swift. Used for custom executors
		.package(url: "https://github.com/apple/swift-nio.git", from: "2.65.0"),

		// fluent
		.package(url: "https://github.com/vapor/fluent.git", from: "4.12.0"),
		.package(url: "https://github.com/vapor/fluent-sqlite-driver.git", from: "4.8.0"),
	],
	targets: [
		.executableTarget(
			name: "MrScroogeServer",
			dependencies: [
				.product(name: "Vapor", package: "vapor"),
				.product(name: "NIOCore", package: "swift-nio"),
				.product(name: "NIOPosix", package: "swift-nio"),
				.product(name: "Fluent", package: "fluent"),
				.product(
					name: "FluentSQLiteDriver", package: "fluent-sqlite-driver"),
			],
			path: "src/swift-server",
			swiftSettings: swiftSettings
		),
		.testTarget(
			name: "MrScroogeServerTests",
			dependencies: [
				.target(name: "MrScroogeServer"),
				.product(name: "XCTVapor", package: "vapor"),
			],
			path: "src/swift-server-tests",
			swiftSettings: swiftSettings
		),
		.testTarget(
			name: "MrScroogeServerSwiftTests",
			dependencies: [
				.target(name: "MrScroogeServer"),
				.product(name: "VaporTesting", package: "vapor"),
			],
			path: "src/swift-server-swift-tests",
			swiftSettings: swiftSettings
		),

	],
	swiftLanguageModes: [.v5]
)

var swiftSettings: [SwiftSetting] {
	[
		.enableUpcomingFeature("DisableOutwardActorInference"),
		.enableExperimentalFeature("StrictConcurrency"),
	]
}
