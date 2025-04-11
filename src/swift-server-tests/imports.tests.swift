import Fluent
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("Import Tests")
final class ImportTests: BaseWithFactories {

	func sendImportRequest(
		app: Application, headers immutableHeaders: HTTPHeaders, file: URL,
		andKind kind: String
	) async throws -> TestingHTTPResponse {
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

		let apiTester = try app.testing()
		return try await apiTester.sendRequest(
			.POST, "/api/imports", headers: headers, body: ByteBuffer(data: body))
	}
	@Test("Get parsers list")
	func testGetParsersList() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let parsersResponse = try await apiTester.sendRequest(
				.GET, "/api/imports/parsers", headers: headers)
			#expect(parsersResponse.status == .ok)

			let responseData = try parsersResponse.content.decode(
				Components.Schemas.ListFileParsers.self)

			#expect(responseData.parsers.count > 0)
		}
	}

	@Test("Upload file")
	func testUploadFile() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let fileUrl = try #require(
				Bundle.module.url(forResource: "n26_es", withExtension: "csv"))
			let response = try await sendImportRequest(
				app: app, headers: headers, file: fileUrl, andKind: "n26/es"
			)

			#expect(response.status == .created)
			let body = try? response.content.decode(Components.Schemas.FileImport.self)
			#expect(body != nil)
		}
	}

	@Test("Get imports")
	func testGetImports() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let commerzBankPath = try #require(
				Bundle.module.url(forResource: "commerz_bank", withExtension: "CSV")
			)

			let _ = try await sendImportRequest(
				app: app, headers: headers, file: commerzBankPath,
				andKind: "commerz-bank-2024/en")

			let response = try await apiTester.sendRequest(
				.GET, "/api/imports", headers: headers)

			let data = try response.content.decode(
				Operations.ApiImports_list.Output.Ok.Body.jsonPayload.self)

			#expect(data.results.count == 1)

			guard let first = data.results.first else {
				return
			}
			#expect(first.description == "")
			#expect(first.status == .ok)
			#expect(first.rows.count == 12)
		}
	}

	@Test("Delete import")
	func testDeleteImport() async throws {
		try await withApp { app in
			let testData = try await createGroupsAndUsers(app: app)
			let apiTester = try app.testing()
			let headers = try await apiTester.headers(
				forUser: .init(
					username: testData.user.username, password: testData.userPwd
				))

			let commerzBankPath = try #require(
				Bundle.module.url(forResource: "commerz_bank", withExtension: "CSV")
			)

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

			let response = try await apiTester.sendRequest(
				.DELETE, "/api/imports/\(secondImport.id)", headers: headers)

			#expect(response.status == .ok)

			let data = try response.content.decode(Bool.self)

			#expect(data == true)

			let allCount = try await FileImportReport.query(on: app.db).count()
			#expect(allCount == 1)

			let firstImportCount = try await FileImportReport.query(on: app.db).filter(
				\.$id == UUID(firstImport.id)!
			).count()
			#expect(firstImportCount == 1)

			let secondImportCount = try await FileImportReport.query(on: app.db).filter(
				\.$id == UUID(secondImport.id)!
			).count()
			#expect(secondImportCount == 0)
		}
	}
}
