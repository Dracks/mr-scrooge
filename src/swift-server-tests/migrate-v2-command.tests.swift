import Fluent
import Testing
import VaporTesting

@testable import MrScroogeServer

@Suite("Migration Tests")
final class MigrateV2Test {

	@Test("V2 Migrate Command")
	func testV2MigrateCommand() async throws {
		try await withApp { app in
			let dbPath = try #require(
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

			let labels = try await Label.query(on: app.db).filter(
				\.$groupOwner.$id == groupId
			)
			.all()
			#expect(labels.count == 3, "Labels number is not valid")

			func getLabelIdByName(_ name: String) throws -> UUID? {
				return try labels.first { $0.name == name }?.requireID()
			}

			let rules = try await Rule.query(on: app.db).filter(
				\.$groupOwner.$id == groupId
			)
			.all()

			#expect(rules.count == 3, "Rules number is not valid")

			let ruleExpenses = rules.filter { $0.name == "Expenses" }.first
			#expect(ruleExpenses != nil)
			if let ruleExpenses {
				try await ruleExpenses.$labels.load(on: app.db)
				try await ruleExpenses.$conditions.load(on: app.db)
				#expect(ruleExpenses.$parent.id == nil, "Parent rule")
				#expect(ruleExpenses.labels.map({ $0.name }) == ["Expenses"])
				#expect(ruleExpenses.conditionsRelation == .or)
				#expect(
					ruleExpenses.conditions.count == 1,
					"It has the correct number of conditions")
			}

			let ruleWithParent = rules.filter { $0.name == "With parent" }.first
			#expect(ruleWithParent != nil)
			if let ruleWithParent {
				try await ruleWithParent.$labels.load(on: app.db)
				try await ruleWithParent.$conditions.load(on: app.db)
				#expect(ruleWithParent.$parent.id != nil, "Parent rule")
				#expect(ruleWithParent.labels.map({ $0.name }) == ["With parent"])
				#expect(ruleWithParent.conditionsRelation == .notAnd)
				#expect(
					ruleWithParent.conditions.count == 6,
					"It has the correct number of conditions")
			}

			let transactionsCount = try await BankTransaction.query(on: app.db).filter(
				\.$groupOwner.$id == groupId
			).count()
			#expect(transactionsCount == 296)

			let november9Transaction = try await BankTransaction.query(on: app.db)
				.filter(\.$_date == DateOnly("2019-11-09")?.getDate() ?? Date())
				.with(\.$labels)
				.first()
			#expect(november9Transaction != nil)
			#expect(november9Transaction?.$groupOwner.id == groupId)
			#expect(november9Transaction?.comment == "The description")
			#expect(november9Transaction?.value == -2.88)
			#expect(november9Transaction?.movementName == "OPERACIÓ VIKINI")
			#expect(november9Transaction?.details == "TARGETA *5019")
			#expect(november9Transaction?.kind == "caixa-enginyers/account")
			#expect(november9Transaction?.dateValue?.toString() == "2019-11-09")

			#expect(november9Transaction?.labels.count == 1)
			#expect(
				november9Transaction?.labels.map { $0.name } == ["Expenses"])

			let august4Transaction = try await BankTransaction.query(on: app.db)
				.filter(\.$_date == DateOnly("2019-08-04")?.getDate() ?? Date())
				.with(\.$labels)
				.first()
			#expect(august4Transaction != nil)
			#expect(august4Transaction?.$groupOwner.id == groupId)
			#expect(august4Transaction?.comment == nil)
			#expect(august4Transaction?.value == 1500.0)
			#expect(august4Transaction?.movementName == "Dr Who")
			#expect(august4Transaction?.details == "Transfer")
			#expect(august4Transaction?.kind == "caixa-enginyers/account")
			#expect(august4Transaction?.dateValue?.toString() == "2019-08-04")

			#expect(august4Transaction?.labels.count == 1)
			#expect(
				august4Transaction?.labels.map { $0.name } == ["Revenues"])

			let graphsPage = try await app.graphService.getGraphs(
				groupsId: [groupId], graphsIds: nil)
			#expect(graphsPage.list.count == 3)

			let incomeVsOutcome = graphsPage.list.first {
				$0.name == "Income vs outcome"
			}
			#expect(incomeVsOutcome != nil)
			if let incomeVsOutcome {
				#expect(
					incomeVsOutcome
						== .init(
							id: incomeVsOutcome.id,
							groupOwnerId: groupId.uuidString,
							name: "Income vs outcome", kind: .bar,
							dateRange: .oneYear,
							group: .init(group: .sign),
							horizontalGroup: .init(
								group: .month, accumulate: false),
							order: 1
						),
					"Income vs Outcome correctly transformed")
			}

			let compareByDay = graphsPage.list.first { $0.name == "Compare by day" }
			#expect(compareByDay != nil)
			if let compareByDay {
				let comparation = try Components.Schemas.Graph(
					id: compareByDay.id,
					groupOwnerId: groupId.uuidString,
					name: "Compare by day", kind: .line,
					labelFilterId: getLabelIdByName("Expenses")?
						.uuidString,
					dateRange: .halfYear,
					group: .init(group: .month),
					horizontalGroup: .init(
						group: .day, accumulate: true),
					order: 2
				)
				#expect(
					compareByDay == comparation,
					"Compare by day graph correctly transformed")
			}

			let testPie = graphsPage.list.first { $0.name == "Test Pie" }
			#expect(testPie != nil)

			if let testPie {
				try #expect(
					testPie
						== .init(
							id: testPie.id,
							groupOwnerId: groupId.uuidString,
							name: "Test Pie", kind: .pie,
							dateRange: .all,
							group: .init(
								group: .labels,
								hideOthers: true,
								labels: ["With parent", "Expenses"]
									.map {
										try
											getLabelIdByName(
												$0)?
											.uuidString
											?? ""
									}
							),
							order: 3
						), "Test pie graph correctly transformed")
			}
		}
	}

	@Test("Invalid URL")
	func testInvalidUrl() async throws {
		try await withApp { app in
			let dbPath = try #require(
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

			let output = console
				.testOutputQueue
				.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }

			#expect(!output.isEmpty)
			#expect(
				output.first?.contains(
					"Invalid database URL format. Must start with \'sqlite://\' or \'postgres://\'"
				) == true
			)
		}
	}
}
