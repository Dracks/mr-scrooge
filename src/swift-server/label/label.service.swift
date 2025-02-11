import Fluent
import Vapor

final class LabelService: ServiceWithDb, @unchecked Sendable {
	private let cursorHandler = CursorHandler<Label, String>(["id"])
	func createLabel(label: Label) async throws -> Label {
		try await label.save(on: db)
		try await label.$groupOwner.load(on: db)
		return label
	}

	func getAll(pageQuery: PageQuery = .init(), groupIds: [UUID]) async throws
		-> ListWithCursor<Label>
	{
		var query = Label.query(on: db)
			.filter(\.$groupOwner.$id ~~ groupIds)

		if let cursor = pageQuery.cursor {
			let cursorData = try self.cursorHandler.parse(cursor)
			if let idString = cursorData["id"], let id = UUID(uuidString: idString) {
				query = query.filter(\.$id < id)
			}
		}

		let data =
			try await query
			.sort(\.$id, .descending)
			.limit(pageQuery.limit)
			.with(\.$groupOwner)
			.all()

		return pageQuery.getListWithCursor(data: data) { last in
			self.cursorHandler.stringify(["id": last.id!.uuidString])
		}
	}

	enum UpdateLabelReturn {
		case ok(label: Label)
		case notFound
	}

	func updateLabel(
		withId labelId: UUID, data: Components.Schemas.UpdateLabel, forUser user: User
	) async throws -> UpdateLabelReturn {
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		let label = try await Label.query(on: db).filter(\.$id == labelId).filter(
			\.$groupOwner.$id ~~ validGroupsIds
		).first()
		guard let label else {
			return .notFound
		}
		label.name = data.name
		try await label.save(on: db)
		return .ok(label: label)
	}

	enum DeleteLabelReturn {
		case ok
		case notFound
		case inUse(
			transactions: [UUID], graphs: [UUID], graphGroups: [UUID],
			graphHorizontalGroups: [UUID], rules: [UUID])
	}

	func deleteLabel(withId labelId: UUID, deleteAll: Bool, forUser user: User) async throws
		-> DeleteLabelReturn
	{
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		return try await db.transaction { transaction in
			let label = try await Label.query(on: transaction).filter(\.$id == labelId)
				.filter(
					\.$groupOwner.$id ~~ validGroupsIds
				).first()
			guard let label else {
				return .notFound
			}
			let labelId = try label.requireID()

			let transactionsLinks = try await LabelTransaction.query(on: transaction)
				.filter(
					\.$label.$id == labelId
				).all()

			let graphs = try await Graph.query(on: transaction).filter(
				\.$labelFilter.$id == labelId
			).all()

			let graphsGroup = try await GraphGroupLabels.query(on: transaction).filter(
				\.$id.$label.$id == labelId
			).all()

			let graphsHorizontalGroup = try await GraphHorizontalGroupLabels.query(
				on: transaction
			).filter(
				\.$id.$label.$id == labelId
			).all()

			let rules = try await RuleLabelAction.query(on: transaction).filter(
				\.$label.$id == labelId
			).all()
			if !transactionsLinks.isEmpty || !graphs.isEmpty || !graphsGroup.isEmpty
				|| !graphsHorizontalGroup.isEmpty || !rules.isEmpty
			{
				if !deleteAll {
					return try .inUse(
						transactions: transactionsLinks.map {
							$0.$transaction.id
						},
						graphs: graphs.map { try $0.requireID() },
						graphGroups: graphsGroup.map {
							try $0.requireID().$graph.id
						},
						graphHorizontalGroups: graphsHorizontalGroup.map {
							try $0.requireID().$graph.id
						}, rules: rules.map { $0.$rule.id })
				} else {
					for graph in graphs {
						graph.$labelFilter.id = nil
						try await graph.save(on: transaction)
					}

					for groupLabel in graphsGroup {
						try await groupLabel.delete(on: transaction)
					}

					for groupLabel in graphsHorizontalGroup {
						try await groupLabel.delete(on: transaction)
					}

					for transactionLabel in transactionsLinks {
						try await transactionLabel.delete(on: transaction)
					}

					for ruleLabel in rules {
						try await ruleLabel.delete(on: transaction)
					}
				}
			}

			try await label.delete(on: transaction)
			return .ok
		}
	}
}
