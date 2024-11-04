// swift-tools-version: 5.10
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
	name: "mr-scrooge",
	platforms: [
		.macOS(.v13)
	],
	dependencies: [
		// OpenAPI
		.package(url: "https://github.com/apple/swift-openapi-generator", from: "1.4.0"),
		.package(url: "https://github.com/apple/swift-openapi-runtime", from: "1.6.0"),
		.package(url: "https://github.com/swift-server/swift-openapi-vapor", from: "1.0.0"),
		// Vapor
		.package(url: "https://github.com/vapor/vapor", from: "4.106.0"),
		.package(url: "https://github.com/vapor/leaf.git", from: "4.4.0"),
		.package(url: "https://github.com/vapor/queues.git", from: "1.16.1"),

		// fluent
		.package(url: "https://github.com/vapor/fluent.git", from: "4.12.0"),
		.package(
			url: "https://github.com/vapor/fluent-postgres-driver.git", from: "2.10.0"),
		.package(url: "https://github.com/vapor/fluent-sqlite-driver.git", from: "4.8.0"),
		.package(
			url: "https://github.com/vapor-community/vapor-queues-fluent-driver",
			branch: "main"),

		// Parser libs
		.package(url: "https://github.com/scinfu/SwiftSoup.git", from: "2.6.0"),
		.package(url: "https://github.com/yaslab/CSV.swift.git", from: "2.5.0"),

		// Tools
		.package(url: "https://github.com/swiftlang/swift-format", from: "600.0.0"),

		// dependency injection
		.package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.4.1"),
	],
	targets: [
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
				.product(name: "XCTVapor", package: "vapor"),
				.product(name: "XCTQueues", package: "queues"),
			],
			path: "src/swift-server-tests",
			resources: [
				.process("test_files/commerz_bank.CSV"),
				.process("test_files/MovimientosCuenta.xls"),
				.process("test_files/MovimientosTarjetaCredito.xls"),
				.process("test_files/n26_es.csv"),
			]
		),

	]
)
