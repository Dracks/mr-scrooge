// swift-tools-version:6.0

import PackageDescription

let package = Package(
    name: "GoCardlessClient",
    platforms: [
        .macOS(.v13),
    ],
    products: [
        .library(
            name: "GoCardlessClient",
            targets: ["OpenAPIClient"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "OpenAPIClient",
            dependencies: [],
            path: "Sources/OpenAPIClient"
        ),
    ],
    swiftLanguageModes: [.v6]
)
