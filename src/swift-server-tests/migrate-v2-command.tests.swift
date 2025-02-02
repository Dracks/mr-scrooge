import Fluent
import Vapor
import XCTVapor

@testable import MrScroogeServer

final class MigrateV2Test: AbstractBaseTestsClass {

	func testV2MigrateCommand() async throws {
		let app = try getApp()

		let dbPath = try XCTUnwrap(
			Bundle.module.url(forResource: "old", withExtension: "sqlite3"))

		let migrateTestGroup = UserGroup(name: "Migration")
		try await migrateTestGroup.save(on: app.db)
		let groupId = try migrateTestGroup.requireID()

		let command = V2MigrateCommand()
		let arguments = [
			"v2_migrate", "sqlite://\(dbPath)", groupId.uuidString,
		]

		let console = TestConsole()
		let input = CommandInput(arguments: arguments)
		var context = CommandContext(
			console: console,
			input: input
		)

		context.application = app

		try await console.run(command, with: context)

		/*let output = console
			.testOutputQueue
			.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }

		XCTAssertTrue(output.count > 0)
		XCTAssertContains(output.first, "labels create from tags")*/

		let labels = try await Label.query(on: app.db).filter(\.$groupOwner.$id == groupId)
			.all()
		XCTAssertEqual(labels.count, 3, "Labels number is not valid")

		func getLabelIdByName(_ name: String) throws -> UUID? {
			return try labels.first { $0.name == name }?.requireID()
		}
		/*let labelsDict: [UUID: String] = try labels.reduce(into: [:]) {
			partialResult, label in
			let labelId = try label.requireID()
			partialResult[labelId] = label.name
		}*/

		let rules = try await Rule.query(on: app.db).filter(\.$groupOwner.$id == groupId)
			.all()

		XCTAssertEqual(rules.count, 3, "Rules number is not valid")

		let ruleWithParent = rules.filter { $0.name == "With parent" }.first
		XCTAssertNotNil(ruleWithParent)
		if let ruleWithParent {
			try await ruleWithParent.$labels.load(on: app.db)
			try await ruleWithParent.$conditions.load(on: app.db)
			XCTAssertNotNil(ruleWithParent.$parent.id, "Parent rule")
			XCTAssertEqual(ruleWithParent.labels.map({ $0.name }), ["With parent"])
			XCTAssertEqual(
				ruleWithParent.conditions.count, 6,
				"It has the correct number of conditions")
		}

		let transactionsCount = try await BankTransaction.query(on: app.db).filter(
			\.$groupOwner.$id == groupId
		).count()
		XCTAssertEqual(transactionsCount, 296)

		let november9Transaction = try await BankTransaction.query(on: app.db)
			.filter(\.$_date == "2019-11-09")
			.with(\.$labels)
			.first()
		XCTAssertNotNil(november9Transaction)
		XCTAssertEqual(november9Transaction?.$groupOwner.id, groupId)
		XCTAssertEqual(november9Transaction?.description, "The description")
		XCTAssertEqual(november9Transaction?.value, -2.88)
		XCTAssertEqual(november9Transaction?.movementName, "OPERACIÓ VIKINI")
		XCTAssertEqual(november9Transaction?.details, "TARGETA *5019")
		XCTAssertEqual(november9Transaction?.kind, "caixa-enginyers/account")
		XCTAssertEqual(november9Transaction?.dateValue?.toString(), "2019-11-09")

		XCTAssertEqual(november9Transaction?.labels.count, 1)
		XCTAssertEqual(
			november9Transaction?.labels.map { $0.name }, ["Expenses"])

		let august4Transaction = try await BankTransaction.query(on: app.db)
			.filter(\.$_date == "2019-08-04")
			.with(\.$labels)
			.first()
		XCTAssertNotNil(august4Transaction)
		XCTAssertEqual(august4Transaction?.$groupOwner.id, groupId)
		XCTAssertEqual(august4Transaction?.description, nil)
		XCTAssertEqual(august4Transaction?.value, 1500.0)
		XCTAssertEqual(august4Transaction?.movementName, "Dr Who")
		XCTAssertEqual(august4Transaction?.details, "Transfer")
		XCTAssertEqual(august4Transaction?.kind, "caixa-enginyers/account")
		XCTAssertEqual(august4Transaction?.dateValue?.toString(), "2019-08-04")

		XCTAssertEqual(august4Transaction?.labels.count, 1)
		XCTAssertEqual(
			august4Transaction?.labels.map { $0.name }, ["Revenues"])

		// TODO: Add the validations
		let graphsPage = try await app.graphService.getGraphs(
			groupsId: [groupId], graphsIds: nil)
		XCTAssertEqual(graphsPage.list.count, 3)

		let incomeVsOutcome = graphsPage.list.first { $0.name == "Income vs outcome" }
		XCTAssertNotNil(incomeVsOutcome)
		if let incomeVsOutcome {
			XCTAssertEqual(
				incomeVsOutcome,
				.init(
					id: incomeVsOutcome.id, groupOwnerId: groupId.uuidString,
					name: "Income vs outcome", kind: .bar,
					dateRange: .oneYear,
					group: .init(group: .sign),
					horizontalGroup: .init(group: .month, accumulate: false)
				),
				"Income vs Outcome correctly transformed")
		}

		let compareByDay = graphsPage.list.first { $0.name == "Compare by day" }
		XCTAssertNotNil(compareByDay)
		if let compareByDay {
			try XCTAssertEqual(
				compareByDay,
				.init(
					id: compareByDay.id, groupOwnerId: groupId.uuidString,
					name: "Compare by day", kind: .line,
					labelFilterId: getLabelIdByName("Expenses")?.uuidString,
					dateRange: .halfYear,
					group: .init(group: .month),
					horizontalGroup: .init(group: .day, accumulate: true)
				),
				"Compare by day graph correctly transformed")
		}

		let testPie = graphsPage.list.first { $0.name == "Test Pie" }
		XCTAssertNotNil(testPie)

		if let testPie {
			try XCTAssertEqual(
				testPie,
				.init(
					id: testPie.id, groupOwnerId: groupId.uuidString,
					name: "Test Pie", kind: .pie,
					dateRange: .all,
					group: .init(
						group: .labels,
						hideOthers: true,
						labels: ["With parent", "Expenses"].map {
							try getLabelIdByName($0)?.uuidString ?? ""
						}
					)
				), "Test pie graph correctly transformed")
		}
	}

	func testInvalidUrl() async throws {
		let app = try getApp()

		let dbPath = try XCTUnwrap(
			Bundle.module.url(forResource: "old", withExtension: "sqlite3"))

		let migrateTestGroup = UserGroup(name: "Migration")
		try await migrateTestGroup.save(on: app.db)
		let groupId = try migrateTestGroup.requireID()

		let command = V2MigrateCommand()
		let arguments = [
			"v2_migrate", "sqlte://\(dbPath)", groupId.uuidString,
		]

		let console = TestConsole()
		let input = CommandInput(arguments: arguments)
		var context = CommandContext(
			console: console,
			input: input
		)

		context.application = app

		try await console.run(command, with: context)

		// XCTAssertNil(console.testOutputQueue)

		let output = console
			.testOutputQueue
			.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }

		XCTAssertTrue(output.count > 0)
		XCTAssertContains(
			output.first,
			"Invalid database URL format. Must start with \'sqlite://\' or \'postgres://\'"
		)
	}
}
