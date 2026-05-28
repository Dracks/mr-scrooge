import OpenAPIRuntime
import Vapor
import OpenAPIAsyncHTTPClient

private struct MrScroogeTransportKey: StorageKey {
	typealias Value = MrScroogeClientTransport
}

struct MrScroogeClientTransport: Sendable {
	let transport: any ClientTransport
	
	init(_ transport: any ClientTransport) {
	    self.transport = transport
	}
}

extension Application {
	var mrScroogeTransport: (any ClientTransport) {
		get { 
		    if let existing = self.storage[MrScroogeTransportKey.self]?.transport {
						return existing
						}
			let asyncHttp = AsyncHTTPClientTransport();
			self.storage[MrScroogeTransportKey.self] = .init(asyncHttp);
			return asyncHttp;
		}
		set { 
		self.storage[MrScroogeTransportKey.self] = .init(newValue) 
		}
	}
}