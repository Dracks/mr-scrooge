import Vapor

/* extension Application {
	public struct GocardlessHTTPClientKey: StorageKey {
		public typealias Value = HTTPClient
	}

	public var gocardlessHTTPClient: HTTPClient {
		if let existing = storage[GocardlessHTTPClientKey.self] {
			return existing
		}
		let client = HTTPClient(eventLoopGroupProvider: .singleton)
		storage[GocardlessHTTPClientKey.self] = client
		lifecycle.use(GocardlessHTTPClientShutdown(client: client))
		return client
	}

	public struct GocardlessHTTPClientShutdown: LifecycleHandler {
		let client: HTTPClient

		func shutdown(_: Application) async {
			try? await client.shutdown()
		}
	}

	public func injectMockHTTPClient(_ client: HTTPClient) {
		storage[GocardlessHTTPClientKey.self] = client
		lifecycle.use(GocardlessHTTPClientShutdown(client: client))
	}
} */
