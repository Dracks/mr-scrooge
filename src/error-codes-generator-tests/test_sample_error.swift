import Testing
import Yams

@testable import ErrorCodesGenerator

@Suite("Generate a default data")
final class DefaultData {
	@Test("Base generate function")
	func testGenerateErrorCodes() {
		let output = generateErrorCodes(from: [
			"E1001": .init(message: "Hello world", additionalInfo: nil)
		])

		// Check that the generated code contains expected elements
		#expect(
			output.contains(
				"public enum ErrorCodes: String, CaseIterable, Sendable, ErrorMsg"))
		#expect(output.contains("case E1001"))
		#expect(output.contains("public var message: String"))
		#expect(output.contains("case .E1001:"))
		#expect(output.contains("return \"Hello world\""))
		#expect(output.contains("public var additionalInfo: String?"))
	}

	@Test("Generate function with additional info")
	func testGenerateErrorCodesWithAdditionalInfo() {
		let output = generateErrorCodes(from: [
			"E1002": .init(
				message: "Error with additional info",
				additionalInfo: "Check configuration")
		])

		// Check that the generated code contains expected elements
		#expect(output.contains("case E1002"))
		#expect(output.contains("return \"Error with additional info\""))
		#expect(output.contains("return \"Check configuration\""))
	}

	@Test("Generate function with multiple error codes")
	func testGenerateMultipleErrorCodes() {
		let output = generateErrorCodes(from: [
			"E1001": .init(message: "First error", additionalInfo: nil),
			"E1003": .init(
				message: "Third error", additionalInfo: "Additional info for third"),
			"E1002": .init(
				message: "Second error",
				additionalInfo: "Additional info for second"),
		])

		// Check that all cases are present
		#expect(output.contains("case E1001"))
		#expect(output.contains("case E1002"))
		#expect(output.contains("case E1003"))

		// Check that messages are correctly mapped
		#expect(output.contains("return \"First error\""))
		#expect(output.contains("return \"Second error\""))
		#expect(output.contains("return \"Third error\""))

		// Check that additional info is correctly handled
		#expect(output.contains("return nil"))  // for E1001
		#expect(output.contains("return \"Additional info for second\""))  // for E1002
		#expect(output.contains("return \"Additional info for third\""))  // for E1003

		// Verify that the codes are sorted alphabetically
		let e1001Index = output.range(of: "case E1001")?.lowerBound
		let e1002Index = output.range(of: "case E1002")?.lowerBound
		let e1003Index = output.range(of: "case E1003")?.lowerBound

		if let e1001Idx = e1001Index,
			let e1002Idx = e1002Index,
			let e1003Idx = e1003Index
		{
			#expect(e1001Idx < e1002Idx)
			#expect(e1002Idx < e1003Idx)
		}
	}

	@Test("Escape special characters properly")
	func testEscapeSpecialCharacters() {
		let output = generateErrorCodes(from: [
			"E1004": .init(
				message: "Error with \"quote\", newline\nand tab\tand \\backslash",
				additionalInfo: "Info with \"quote\"\nand\\backslash"),
			"E1005": .init(message: "Simple message", additionalInfo: nil),
		])

		// Check that special characters are properly escaped in messages
		#expect(
			output.contains(
				"return \"Error with \\\"quote\\\", newline\\nand tab\\tand \\\\backslash\""
			))
		#expect(output.contains("return \"Info with \\\"quote\\\"\\nand\\\\backslash\""))
		#expect(output.contains("return nil"))  // for E1005 which has no additional info
	}
}
