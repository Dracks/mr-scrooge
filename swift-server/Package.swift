// swift-tools-version:5.9
import PackageDescription

let package = Package(
	name: "MrScrooge-swift-server",
	platforms: [
		.macOS(.v13)
	],
	dependencies: [
		// 💧 A server-side Swift web framework.
		.package(url: "https://github.com/vapor/vapor.git", from: "4.83.1"),
		.package(url: "https://github.com/vapor/leaf.git", from: "4.4.0"),

		// 🗄 An ORM for Swift
		.package(url: "https://github.com/vapor/fluent.git", from: "4.8.0"),
		.package(url: "https://github.com/vapor/fluent-postgres-driver.git", from: "2.0.0"),
		.package(url: "https://github.com/vapor/fluent-sqlite-driver.git", from: "4.0.0"),

		// Swagger
		.package(url: "https://github.com/Dracks/VaporToOpenAPI.git", branch: "main"),

		// 🚀 A GraphQL server library for Swift
		.package(url: "https://github.com/alexsteinerde/graphql-kit.git", from: "3.0.0"),
		.package(url: "https://github.com/alexsteinerde/graphiql-vapor.git", from: "2.0.0"),

		// GraphQL client for tests?
		// .package(url: "https://github.com/maticzav/swift-graphql.git", from: "5.1.3")

		// Parser libs
		.package(url: "https://github.com/scinfu/SwiftSoup.git", from: "2.6.0"),
		.package(url: "https://github.com/yaslab/CSV.swift.git", from: "2.5.0"),

		// Tools
		.package(url: "https://github.com/swiftlang/swift-format", from: "510.1.0"),

		// Dependencies from externals
		// .package(url: "https://github.com/Dracks/SwiftOpenAPI.git", branch: "main"),
		//.package(url: "https://github.com/pointfreeco/swift-custom-dump.git", from: "0.10.3"),
	],
	targets: [
		.executableTarget(
			name: "App",
			dependencies: [
				.product(name: "Vapor", package: "vapor"),
				.product(name: "Fluent", package: "fluent"),
				.product(name: "Leaf", package: "leaf"),
				.product(
					name: "FluentPostgresDriver",
					package: "fluent-postgres-driver"),
				.product(
					name: "FluentSQLiteDriver", package: "fluent-sqlite-driver"),
				.product(name: "GraphQLKit", package: "graphql-kit"),
				.product(name: "GraphiQLVapor", package: "graphiql-vapor"),
				"SwiftSoup",
				.product(name: "CSV", package: "CSV.swift"),
				"VaporToOpenAPI",
			],
			path: "app",
			swiftSettings: [
				// Enable better optimizations when building in Release configuration. Despite the use of
				// the `.unsafeFlags` construct required by SwiftPM, this flag is recommended for Release
				// builds. See <https://github.com/swift-server/guides/blob/main/docs/building.md#building-for-production> for details.
				.unsafeFlags(
					["-cross-module-optimization"],
					.when(configuration: .release))
			]
		),
		.testTarget(
			name: "AppTests",
			dependencies: [
				.target(name: "App"),
				.product(name: "XCTVapor", package: "vapor"),
				// .product(name: "SwiftGraphQL", package: "swift-graphql")
			], path: "app-tests"),
	]
)
