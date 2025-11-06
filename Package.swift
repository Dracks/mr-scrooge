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
		// OpenAPI
		.package(url: "https://github.com/apple/swift-openapi-generator", from: "1.10.3"),
		.package(url: "https://github.com/apple/swift-openapi-runtime", from: "1.8.3"),
		.package(url: "https://github.com/swift-server/swift-openapi-vapor", from: "1.0.1"),
		// Vapor
		.package(url: "https://github.com/vapor/vapor.git", from: "4.119.0"),
		.package(url: "https://github.com/vapor/leaf.git", from: "4.5.1"),
		.package(url: "https://github.com/vapor/queues.git", from: "1.17.2"),

		// fluent
		.package(url: "https://github.com/vapor/fluent.git", from: "4.13.0"),
		.package(
			url: "https://github.com/vapor/fluent-postgres-driver.git", from: "2.12.0"),
		.package(url: "https://github.com/vapor/fluent-sqlite-driver.git", from: "4.8.1"),
		.package(
			url: "https://github.com/vapor-community/vapor-queues-fluent-driver",
			branch: "3.0.0"),

		// Parser libs
		.package(url: "https://github.com/scinfu/SwiftSoup.git", from: "2.11.1"),
		.package(url: "https://github.com/yaslab/CSV.swift.git", from: "2.5.2"),

		// dependency injection
		.package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.10.0"),
		.package(
			url: "https://github.com/swiftlang/swift-syntax.git", from: "602.0.0"
		),
	],
	targets: [
		.macro(
			name: "swift-macrosMacros",
			dependencies: [
				.product(name: "SwiftSyntaxMacros", package: "swift-syntax"),
				.product(name: "SwiftCompilerPlugin", package: "swift-syntax"),
			],
			path: "src/swift-server-macrosMacros"
		),
		.target(
			name: "swift-macros", dependencies: ["swift-macrosMacros"],
			path: "src/swift-server-macros"),
		.executableTarget(
			name: "MrScroogeServer",
			dependencies: [
				.product(name: "OpenAPIRuntime", package: "swift-openapi-runtime"),
				.product(name: "OpenAPIVapor", package: "swift-openapi-vapor"),
				.product(name: "Vapor", package: "vapor"),
				.product(name: "Dependencies", package: "swift-dependencies"),
				.product(name: "Fluent", package: "fluent"),
				.product(name: "Leaf", package: "leaf"),
				.product(
					name: "FluentPostgresDriver",
					package: "fluent-postgres-driver"),
				.product(
					name: "FluentSQLiteDriver", package: "fluent-sqlite-driver"),
				.product(
					name: "QueuesFluentDriver",
					package: "vapor-queues-fluent-driver"),
				"SwiftSoup",
				.product(name: "CSV", package: "CSV.swift"),
				"swift-macros",
			],
			path: "src/swift-server",
			resources: [
				.process("openapi-generator-config.yaml"),
				.process("openapi.yaml"),
			],
			plugins: [
				.plugin(
					name: "OpenAPIGenerator", package: "swift-openapi-generator"
				)
			]
		),
		.testTarget(
			name: "MrScroogeServerTests",
			dependencies: [
				.target(name: "MrScroogeServer"),
				.product(name: "XCTQueues", package: "queues"),
				.product(name: "VaporTesting", package: "vapor"),
			],
			path: "src/swift-server-tests",
			resources: [
				.process("test_files/commerz_bank.CSV"),
				.process("test_files/MovimientosCuenta.xls"),
				.process("test_files/MovimientosTarjetaCredito.xls"),
				.process("test_files/n26_es.csv"),
				.process("test_files/old.sqlite3"),
			]
		),

	]
)
