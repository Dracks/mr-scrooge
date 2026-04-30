import Vapor

public extension Application {
	struct GocardlessHTTPClientKey: StorageKey {
		public typealias Value = HTTPClient
	}

	var gocardlessHTTPClient: HTTPClient {
		get {
			if let existing = storage[GocardlessHTTPClientKey.self] {
				return existing
			}
			let client = HTTPClient(eventLoopGroupProvider: .singleton)
			storage[GocardlessHTTPClientKey.self] = client
			lifecycle.use(GocardlessHTTPClientShutdown(client: client))
			return client
		}
	}

	struct GocardlessHTTPClientShutdown: LifecycleHandler {
		let client: HTTPClient

		func shutdown(_: Application) async {
			try? await client.shutdown()
		}
	}

	func injectMockHTTPClient(_ client: HTTPClient) {
		storage[GocardlessHTTPClientKey.self] = client
		lifecycle.use(GocardlessHTTPClientShutdown(client: client))
	}
}
