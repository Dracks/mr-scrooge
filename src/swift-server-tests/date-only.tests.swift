import XCTest

@testable import MrScroogeServer

final class DateOnlyTests: XCTestCase {
	func testInitWithDate() {
		let date = Date(timeIntervalSince1970: 1_609_459_200)  // 2021-01-01
		let dateOnly = DateOnly(date)
		XCTAssertEqual(dateOnly.toString(), "2021-01-01")
	}

	func testInitWithYearMonthDay() {
		let dateOnly = DateOnly(year: 2021, month: 12, day: 31)
		XCTAssertNotNil(dateOnly)
		XCTAssertEqual(dateOnly?.toString(), "2021-12-31")

		// let invalidDate = DateOnly(year: 2021, month: 13, day: 32)
		// XCTAssertNil(invalidDate)
	}

	func testInitWithString() {
		let dateOnly = DateOnly("2022-03-15")
		XCTAssertNotNil(dateOnly)
		XCTAssertEqual(dateOnly?.toString(), "2022-03-15")

		let invalidDate = DateOnly("invalid-date")
		XCTAssertNil(invalidDate)
	}

	func testGetDate() {
		let dateOnly = DateOnly(year: 2023, month: 6, day: 1)!
		let date = dateOnly.getDate()
		let calendar = Calendar.current
		XCTAssertEqual(calendar.component(.year, from: date), 2023)
		XCTAssertEqual(calendar.component(.month, from: date), 6)
		XCTAssertEqual(calendar.component(.day, from: date), 1)
	}

	func testToString() {
		let dateOnly = DateOnly(year: 2024, month: 2, day: 29)!
		XCTAssertEqual(dateOnly.toString(), "2024-02-29")
	}

	func testEquatable() {
		let date1 = DateOnly(year: 2025, month: 7, day: 4)!
		let date2 = DateOnly(year: 2025, month: 7, day: 4)!
		let date3 = DateOnly(year: 2025, month: 7, day: 5)!

		XCTAssertEqual(date1, date2)
		XCTAssertNotEqual(date1, date3)
	}

	func testDescription() {
		let dateOnly = DateOnly(year: 2026, month: 10, day: 31)!
		XCTAssertEqual(dateOnly.description, "2026-10-31")
	}
}
