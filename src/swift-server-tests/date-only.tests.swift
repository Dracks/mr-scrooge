import Foundation
import Testing

@testable import MrScroogeServer

@Suite("Date only")
final class DateOnlyTests {
	@Test("Create with a date")
	func testInitWithDate() {
		let date = Date(timeIntervalSince1970: 1_609_459_200)  // 2021-01-01
		let dateOnly = DateOnly(date)
		#expect(dateOnly.toString() == "2021-01-01")
	}

	@Test("Init with diferent fields")
	func testInitWithYearMonthDay() {
		let dateOnly = DateOnly(year: 2021, month: 12, day: 31)
		#expect(dateOnly != nil)
		#expect(dateOnly?.toString() == "2021-12-31")

		// let invalidDate = DateOnly(year: 2021, month: 13, day: 32)
		// XCTAssertNil(invalidDate)
	}

	@Test("Init with strings")
	func testInitWithString() {
		let dateOnly = DateOnly("2022-03-15")
		#expect(dateOnly != nil)
		#expect(dateOnly?.toString() == "2022-03-15")

		let invalidDate = DateOnly("invalid-date")
		#expect(invalidDate == nil)
	}

	@Test("Get the date from DateOnly")
	func testGetDate() {
		let dateOnly = DateOnly(year: 2023, month: 6, day: 1)!
		let date = dateOnly.getDate()
		let calendar = Calendar.current
		#expect(calendar.component(.year, from: date) == 2023)
		#expect(calendar.component(.month, from: date) == 6)
		#expect(calendar.component(.day, from: date) == 1)
	}

	@Test("Convert to string")
	func testToString() {
		let dateOnly = DateOnly(year: 2024, month: 2, day: 29)!
		#expect(dateOnly.toString() == "2024-02-29")
	}

	@Test("Equatable")
	func testEquatable() {
		let date1 = DateOnly(year: 2025, month: 7, day: 4)!
		let date2 = DateOnly(year: 2025, month: 7, day: 4)!
		let date3 = DateOnly(year: 2025, month: 7, day: 5)!

		#expect(date1 == date2)
		#expect(date1 != date3)
	}

	@Test("Description")
	func testDescription() {
		let dateOnly = DateOnly(year: 2026, month: 10, day: 31)!
		#expect(dateOnly.description == "2026-10-31")
	}
}
