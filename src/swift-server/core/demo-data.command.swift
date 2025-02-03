import Fluent
import Foundation
import Vapor

struct DemoDataCommand: AsyncCommand {
	struct Signature: CommandSignature {
		@Option(name: "group-owner-id", short: "g")
		var groupOwnerId: UUID?
	}

	var help: String {
		"Generates demo data for bank transactions and graphs"
	}

	func run(using context: CommandContext, signature: Signature) async throws {
		guard let groupOwnerId = signature.groupOwnerId else {
			context.console.error("Group owner ID is required")
			return
		}

		let app = context.application

		// Generate demo data
		try await generateDemoData(app: app, groupOwnerId: groupOwnerId)
	}

	private func generateDemoData(app: Application, groupOwnerId: UUID) async throws {
		let labelConfigMap: [String: (ClosedRange<Double>, String)] = [
			"gasoline": (-100...(-30), "days"),
			"groceries": (-100...(-10), "days"),
			"mortgage": (-400...(-400), "monthly"),
			"phone": (-15...(-10), "monthly"),
			"salary": (1800...2100, "monthly"),
		]

		var labelIdMap: [String: UUID] = [:]

		for (label, config) in labelConfigMap {
			let labelId = try await generateLabelsAndTransactions(
				app: app,
				groupOwnerId: groupOwnerId,
				label: label,
				amountRange: config.0,
				periodicity: config.1
			)
			labelIdMap[label] = labelId
		}

		try await generateGraphs(
			app: app, groupOwnerId: groupOwnerId, labelIdMap: labelIdMap)

		try await addRulesAndLabels(app: app, groupOwnerId: groupOwnerId)

		// When not executed, the group attach seems to not work
		let _ = try await Graph.query(on: app.db).first()
	}

	private func addRulesAndLabels(app: Application, groupOwnerId: UUID) async throws {
		let income = Label(groupOwnerId: groupOwnerId, name: "income")
		try await income.save(on: app.db)

		let expenses = Label(groupOwnerId: groupOwnerId, name: "expenses")
		try await expenses.save(on: app.db)

		let aral = Label(groupOwnerId: groupOwnerId, name: "aral")
		try await aral.save(on: app.db)

		let _ = try await Rule.createRule(
			on: app.db, for: groupOwnerId, with: .init(.less, valueDouble: 0),
			toApply: expenses)
		let _ = try await Rule.createRule(
			on: app.db, for: groupOwnerId, with: .init(.greater, valueDouble: 0),
			toApply: income)
		let _ = try await Rule.createRule(
			on: app.db, for: groupOwnerId, with: .init(.contains, valueStr: "aral"),
			toApply: aral)
	}

	private func generateLabelsAndTransactions(
		app: Application, groupOwnerId: UUID, label: String,
		amountRange: ClosedRange<Double>, periodicity: String
	) async throws -> UUID {
		let label = Label(groupOwnerId: groupOwnerId, name: label)
		try await label.save(on: app.db)

		let calendar = Calendar.current
		var date = Date()
		let finishDate = calendar.date(byAdding: .month, value: -6, to: date)!

		while date > finishDate {
			let transaction = BankTransaction(
				groupOwnerId: groupOwnerId,
				movementName: "transaction \(label.name)",
				date: DateOnly(date),
				value: Double.random(in: amountRange),
				kind: "demo"
			)
			try await transaction.save(on: app.db)

			let labelTransaction = LabelTransaction(
				labelId: label.id!, transactionId: transaction.id!,
				linkReason: .automatic)
			try await labelTransaction.save(on: app.db)

			if periodicity == "days" {
				date = calendar.date(
					byAdding: .day, value: -Int.random(in: 1...10), to: date)!
			} else {
				date = calendar.date(byAdding: .month, value: -1, to: date)!
				date = calendar.date(
					byAdding: .day, value: Int.random(in: -1...1), to: date)!
			}
		}

		return label.id!
	}

	private func generateGraphs(
		app: Application, groupOwnerId: UUID, labelIdMap: [String: UUID]
	) async throws {
		let incomeVsExpensesGraph = Graph(
			groupOwnerId: groupOwnerId,
			name: "Income vs expenses",
			kind: .bar,
			dateRange: .halfYear
		)
		try await incomeVsExpensesGraph.save(on: app.db)

		let incomeVsExpensesGroup = GraphGroup(
			graphId: incomeVsExpensesGraph.id!,
			group: .sign
		)
		try await incomeVsExpensesGroup.save(on: app.db)

		let incomeVsExpensesHorizontalGroup = GraphHorizontalGroup(
			graphId: incomeVsExpensesGraph.id!,
			group: .month
		)
		try await incomeVsExpensesHorizontalGroup.save(on: app.db)

		let compareLabelsGraph = Graph(
			groupOwnerId: groupOwnerId,
			name: "Compare labels",
			kind: .line,
			dateRange: .twoYears
		)
		try await compareLabelsGraph.save(on: app.db)

		let compareLabelsGroup = GraphGroup(
			graphId: compareLabelsGraph.id!,
			group: .labels
		)
		try await compareLabelsGroup.save(on: app.db)

		if let groceriesId = labelIdMap["groceries"],
			let gasolineId = labelIdMap["gasoline"]
		{
			let groceriesLabel = GraphGroupLabels(
                graphId: try compareLabelsGraph.requireID(), labelId: groceriesId, order: 0)
			try await groceriesLabel.save(on: app.db)

			let gasolineLabel = GraphGroupLabels(
                graphId: try compareLabelsGraph.requireID(), labelId: gasolineId, order: 1)
			try await gasolineLabel.save(on: app.db)
		}

		let compareLabelsHorizontalGroup = GraphHorizontalGroup(
			graphId: compareLabelsGraph.id!,
			group: .month
		)
		try await compareLabelsHorizontalGroup.save(on: app.db)
	}
}
