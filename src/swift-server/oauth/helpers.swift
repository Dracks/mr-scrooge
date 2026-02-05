import Foundation

enum OAuthCrypto {

	static func generateBase64URLRandom(length: Int = 32) -> String {
		var bytes = [UInt8](repeating: 0, count: length)
		for i in 0..<length {
			bytes[i] = UInt8.random(in: 0...255)
		}
		return Data(bytes).base64URLEncodedString()
	}
}

extension Data {
	func base64URLEncodedString() -> String {
		return self.base64EncodedString()
			.replacingOccurrences(of: "+", with: "-")
			.replacingOccurrences(of: "/", with: "_")
			.replacingOccurrences(of: "=", with: "")
	}
}
