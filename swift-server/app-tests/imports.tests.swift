import Foundation
import XCTVapor

@testable import App

final class ImportTests: AbstractBaseTestsClass {
	func getTestFile(file: String) -> String {
		let pwd = URL(fileURLWithPath: #file).pathComponents
			.prefix(while: { $0 != "app-tests" }).joined(separator: "/").dropFirst()
		return "\(pwd)/\(file)"
	}

	func testUploadFile() async throws {
		let app = try getApp()

		var headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let testFilePath = getTestFile(file: "test_files/n26_es.csv")
		let fileURL = URL(fileURLWithPath: testFilePath)
		let fileData = try Data(contentsOf: fileURL)

		let boundary = "Boundary-\(UUID().uuidString)"
		var body = Data()

		// Add 'kind' field
		body.append("--\(boundary)\r\n".data(using: .utf8)!)
		body.append(
			"Content-Disposition: form-data; name=\"kind\"\r\n\r\n".data(using: .utf8)!)
		body.append("n26/es\r\n".data(using: .utf8)!)

		// Add file data
		body.append("--\(boundary)\r\n".data(using: .utf8)!)
		body.append(
			"Content-Disposition: form-data; name=\"file\"; filename=\"test.csv\"\r\n"
				.data(using: .utf8)!)
		body.append("Content-Type: text/csv\r\n\r\n".data(using: .utf8)!)
		body.append(fileData)
		body.append("\r\n".data(using: .utf8)!)

		body.append("--\(boundary)--\r\n".data(using: .utf8)!)

		headers.add(
			name: "Content-Type", value: "multipart/form-data; boundary=\(boundary)")
		let response = try await app.sendRequest(
			.POST, "/import/upload", headers: headers, body: ByteBuffer(data: body))

		XCTAssertEqual(response.status, .ok)
	}
}
