import GraphQL
import Graphiti
import XCTVapor

@testable import App

final class ImportTests: AbstractBaseTestsClass {
	func getTestFile(file: String) -> String {
		let pwd = URL(fileURLWithPath: #file).pathComponents
			.prefix(while: { $0 != "app-tests" }).joined(separator: "/").dropFirst()
		return "\(pwd)/\(file)"
	}

	func sendImportRequest(app: Application, headers immutableHeaders: HTTPHeaders, file: String, andKind kind: String) async throws -> XCTHTTPResponse {
        var headers = immutableHeaders
		let testFilePath = getTestFile(file: file)
		let fileURL = URL(fileURLWithPath: testFilePath)
		let fileData = try Data(contentsOf: fileURL)

		let boundary = "Boundary-\(UUID().uuidString)"
		var body = Data()

		// Add 'kind' field
		body.append("--\(boundary)\r\n".data(using: .utf8)!)
		body.append(
			"Content-Disposition: form-data; name=\"kind\"\r\n\r\n".data(using: .utf8)!)
		body.append("\(kind)\r\n".data(using: .utf8)!)

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
		return try await app.sendRequest(
			.POST, "/import/upload", headers: headers, body: ByteBuffer(data: body))
	}

	func testUploadFile() async throws {
		let app = try getApp()

				// Get headers for authenticated request
		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

        let response = try await sendImportRequest(app: app, headers: headers, file: "test_files/n26_es.csv", andKind: "n26/es")

		XCTAssertEqual(response.status, .ok)
	}
    
    func testGetImports() async throws {
		let query = try GraphQLFileLoader.sharedInstance.getContent(of: [
			"/imports/get-import-status.graphql"
		])
		let app = try getApp()

		// Get headers for authenticated request
		let headers = try await app.getHeaders(
			forUser: SessionTypes.Credentials(
				username: testUser.username, password: "test-password"))

		let _ = try await sendImportRequest(app: app, headers: headers, file: "test_files/commerz_bank.CSV", andKind: "commerz-bank/en")

		let response = try await app.queryGql(
			GraphQLRequest(query: query), headers: headers)

		// Assert the response
		XCTAssertEqual(response.status, .ok)

		let body = try XCTUnwrap(response.body)
		let data = try JSONDecoder().decode(GraphQLResult.self, from: Data(buffer: body))

		XCTAssertEqual(data.errors, [])

		let imports = try XCTUnwrap(data.data?["getImports"]["results"].array)
		XCTAssertGreaterThan(imports.count, 0)  // Assuming there are some imports to test

		for importResult in imports {
			XCTAssertNotNil(importResult["id"].string)
			XCTAssertNotNil(importResult["description"].string)
			XCTAssertNotNil(importResult["status"].string)
			XCTAssertNotNil(importResult["context"].string)
			XCTAssertNotNil(importResult["rows"].array)
		}
        
    }
}
