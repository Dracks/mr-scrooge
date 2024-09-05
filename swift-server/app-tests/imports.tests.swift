import Foundation
import XCTVapor
/*
final class ImportTests: XCTestCase {
    func testUploadFile() throws {
        let app = Application(.testing)
        defer { app.shutdown() }

        try configure(app)

        let testFilePath = "/path/to/test/file.csv" // Replace with actual test file path
        let fileURL = URL(fileURLWithPath: testFilePath)
        let fileData = try Data(contentsOf: fileURL)

        let boundary = "Boundary-\(UUID().uuidString)"
        var body = Data()

        // Add 'kind' field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"kind\"\r\n\r\n".data(using: .utf8)!)
        body.append("bankStatement\r\n".data(using: .utf8)!)

        // Add file data
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"test.csv\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: text/csv\r\n\r\n".data(using: .utf8)!)
        body.append(fileData)
        body.append("\r\n".data(using: .utf8)!)

        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        try app.test(.POST, "import/upload", headers: [
            "Content-Type": "multipart/form-data; boundary=\(boundary)"
        ], body: body) { response in
            XCTAssertEqual(response.status, .ok)
        }
    }
}*/
