import Fluent
import Foundation
import Vapor

struct DemoDataCommand: Command {
	struct Signature: CommandSignature {
		@Option(name: "group-owner-id", short: "g")
		var groupOwnerId: UUID?
	}

	var help: String {
		"Generates demo data for bank transactions and graphs"
	}

	func run(using context: CommandContext, signature: Signature) throws {
		guard let groupOwnerId = signature.groupOwnerId else {
			context.console.error("Group owner ID is required")
			return
		}

		let app = context.application

		// Generate demo data
		try generateDemoData(app: app, groupOwnerId: groupOwnerId)
	}

	private func generateDemoData(app: Application, groupOwnerId: UUID) throws {
		let labelConfigMap: [String: (ClosedRange<Double>, String)] = [
			"gasoline": (-100...(-30), "days"),
			"groceries": (-100...(-10), "days"),
			"mortgage": (-400...(-400), "monthly"),
			"phone": (-15...(-10), "monthly"),
			"salary": (1800...2100, "monthly"),
		]

		var labelIdMap: [String: UUID] = [:]

		for (label, config) in labelConfigMap {
			let labelId = try generateTagAndTransactions(
				app: app,
				groupOwnerId: groupOwnerId,
				label: label,
				amountRange: config.0,
				periodicity: config.1
			)
			labelIdMap[label] = labelId
		}

		try generateGraphs(app: app, groupOwnerId: groupOwnerId, labelIdMap: labelIdMap)
	}

	private func generateTagAndTransactions(
		app: Application, groupOwnerId: UUID, label: String,
		amountRange: ClosedRange<Double>, periodicity: String
	) throws -> UUID {
		let label = Label(groupOwnerId: groupOwnerId, name: label)
		try label.save(on: app.db).wait()

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
			try transaction.save(on: app.db).wait()

			let labelTransaction = LabelTransaction(
				labelId: label.id!, transactionId: transaction.id!)
			try labelTransaction.save(on: app.db).wait()

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
	) throws {
		let incomeVsExpensesGraph = Graph(
			groupOwnerId: groupOwnerId,
			name: "Income vs expenses",
			kind: .bar,
			dateRange: .halfYear
		)
		try incomeVsExpensesGraph.save(on: app.db).wait()

		let incomeVsExpensesGroup = GraphGroup(
			graphId: incomeVsExpensesGraph.id!,
			group: .sign
		)
		try incomeVsExpensesGroup.save(on: app.db).wait()

		let incomeVsExpensesHorizontalGroup = GraphHorizontalGroup(
			graphId: incomeVsExpensesGraph.id!,
			group: .month
		)
		try incomeVsExpensesHorizontalGroup.save(on: app.db).wait()

		let compareLabelsGraph = Graph(
			groupOwnerId: groupOwnerId,
			name: "Compare labels",
			kind: .line,
			dateRange: .twoYears
		)
		try compareLabelsGraph.save(on: app.db).wait()

		let compareLabelsGroup = GraphGroup(
			graphId: compareLabelsGraph.id!,
			group: .labels
		)
		try compareLabelsGroup.save(on: app.db).wait()

		if let groceriesId = labelIdMap["groceries"],
			let gasolineId = labelIdMap["gasoline"]
		{
			let groceriesLabel = GraphGroupLabels(
				graphId: compareLabelsGroup.id!, labelId: groceriesId, order: 0)
			try groceriesLabel.save(on: app.db).wait()

			let gasolineLabel = GraphGroupLabels(
				graphId: compareLabelsGroup.id!, labelId: gasolineId, order: 1)
			try gasolineLabel.save(on: app.db).wait()
		}

		let compareLabelsHorizontalGroup = GraphHorizontalGroup(
			graphId: compareLabelsGraph.id!,
			group: .month
		)
		try compareLabelsHorizontalGroup.save(on: app.db).wait()
	}
}
