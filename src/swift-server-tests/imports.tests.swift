import Fluent
import XCTVapor

@testable import MrScroogeServer

final class ImportTests: AbstractBaseTestsClass {

	func sendImportRequest(
		app: Application, headers immutableHeaders: HTTPHeaders, file: URL,
		andKind kind: String
	) async throws -> XCTHTTPResponse {
		var headers = immutableHeaders
		let fileData = try Data(contentsOf: file)

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
			.POST, "/api/imports", headers: headers, body: ByteBuffer(data: body))
	}
    
    func testGetParsersList() async throws {
        let app = try getApp()
        
        let headers = try await app.getHeaders(
            forUser: .init(
                username: testUser.username, password: "test-password"))
        
        let parsersResponse = try await app.sendRequest(.GET, "/api/imports/parsers", headers: headers)
        XCTAssertEqual(parsersResponse.status, .ok)
        
        let responseData = try parsersResponse.content.decode(Components.Schemas.ListFileParsers.self)
        
        XCTAssertNotEqual(responseData.parsers.count, 0)
    }

	func testUploadFile() async throws {
		let app = try getApp()

		// Get headers for authenticated request
		let headers = try await app.getHeaders(
            forUser: .init(
				username: testUser.username, password: "test-password"))
        
        let fileUrl = try XCTUnwrap(Bundle.module.url(forResource: "n26_es", withExtension: "csv"))
		let response = try await sendImportRequest(
			app: app, headers: headers, file: fileUrl, andKind: "n26/es"
		)

		XCTAssertEqual(response.status, .created)
        let body = try response.content.decode(Components.Schemas.FileImport.self)
		XCTAssertNotNil(body)

	}
    
	func testGetImports() async throws {
		let app = try getApp()

		// Get headers for authenticated request
		let headers = try await app.getHeaders(
            forUser: .init(
				username: testUser.username, password: "test-password"))
        
        let commerzBankPath = try XCTUnwrap(Bundle.module.url(forResource: "commerz_bank", withExtension: "CSV"))

		let _ = try await sendImportRequest(
			app: app, headers: headers, file: commerzBankPath,
			andKind: "commerz-bank/en")

		let response = try await app.sendRequest(
			.GET, "/api/imports", headers: headers)

		print(String(buffer: response.body))
		let data = try response.content.decode(Operations.ApiImports_list.Output.Ok.Body.jsonPayload.self)

		XCTAssertGreaterThan(data.results.count, 0)  // Assuming there are some imports to test

		for importData in data.results {
			XCTAssertNotNil(importData.id)
			XCTAssertNotNil(importData.description)
			XCTAssertNotNil(importData.status)
			XCTAssertNotNil(importData.rows)
			XCTAssertGreaterThan(importData.rows.count, 0)
		}
	}

	func testDeleteImport() async throws {
		let app = try getApp()

		// Get headers for authenticated request
		let headers = try await app.getHeaders(
            forUser: .init(
				username: testUser.username, password: "test-password"))
        
        let commerzBankPath = try XCTUnwrap(Bundle.module.url(forResource: "commerz_bank", withExtension: "CSV"))

		let firstImportResponse = try await sendImportRequest(
			app: app, headers: headers, file: commerzBankPath,
			andKind: "commerz-bank/en")

		let secondImportResponse = try await sendImportRequest(
			app: app, headers: headers, file: commerzBankPath,
			andKind: "commerz-bank/en")

		let firstImport = try firstImportResponse.content.decode(
            Components.Schemas.FileImport.self)
		let secondImport = try secondImportResponse.content.decode(
            Components.Schemas.FileImport.self)

		let response = try await app.sendRequest(
			.DELETE, "/api/imports/\(secondImport.id)", headers: headers)

		XCTAssertEqual(response.status, .ok)

		print(String(buffer: response.body))
		let data = try response.content.decode(Bool.self)

		XCTAssertTrue(data)

		let allCount = try await FileImportReport.query(on: app.db).count()
		XCTAssertEqual(allCount, 1)

		let firstImportCount = try await FileImportReport.query(on: app.db).filter(
            \.$id == UUID(firstImport.id)!
		).count()
		XCTAssertEqual(firstImportCount, 1)

		let secondImportCount = try await FileImportReport.query(on: app.db).filter(
			\.$id == UUID(secondImport.id)!
		).count()
		XCTAssertEqual(secondImportCount, 0)
	}
}

