import Fluent
import SQLKit
import Vapor

class DjangoMigrationService {
	class OldDb {
		enum TableNames: String {
			case rdsToTags = "management_valuestotag"
			case graphGroup = "graphs_group"
			case graphGroupTag = "graphs_grouptags"
			case graphHorizontalGroup = "graphs_horizontalgroup"
			case graphHorizontalGroupTag = "graphs_horizontalgrouptags"

		}
	}
	static let PAGE_SIZE = 100

	let groupOwnerId: UUID
	let app: Application
	let oldDb: Database
	let oldSqlDb: SQLDatabase

	var tagIdToLabelId: [Int64: UUID] = [:]
	var tagIdToLabel: [Int64: Label] = [:]
	init(owner groupOwnerId: UUID, app: Application, oldDb: Database, oldSqlDb: SQLDatabase) {
		self.groupOwnerId = groupOwnerId
		self.app = app
		self.oldDb = oldDb
		self.oldSqlDb = oldSqlDb
	}
}

extension DjangoMigrationService.OldDb {
	final class TagModel: Model, @unchecked Sendable {
		static let schema = "management_tag"
		@ID(custom: "id", generatedBy: .database)
		var id: Int64?

		@Field(key: "name")
		var name: String

		@OptionalParent(key: "parent_id")
		var parent: TagModel?

		@Field(key: "negate_conditional")
		var negateConditional: Int
	}

	final class FilterModel: Model, @unchecked Sendable {
		static let schema = "management_filter"

		@ID(custom: "id", generatedBy: .database)
		var id: Int64?

		@Field(key: "tag_id")
		var tagId: Int64

		@Field(key: "type_conditional")
		var typeConditional: String

		@Field(key: "conditional")
		var conditional: String

		func getCondDouble() throws -> Double {
			if let d = Double(conditional) {
				return d
			}
			throw Exception(.E10023, context: ["filterId": id as Any, "tagId": tagId])
		}
		func toBaseCondition() throws -> Rule.BaseCondition {
			switch typeConditional {
			case "c":
				return .init(.contains, valueStr: conditional)
			case "p":
				return .init(.prefix, valueStr: conditional)
			case "s":
				return .init(.suffix, valueStr: conditional)
			case "g":
				return try .init(.greater, valueDouble: getCondDouble())
			case "G":
				return try .init(.greaterEqual, valueDouble: getCondDouble())
			case "L":
				return try .init(.lessEqual, valueDouble: getCondDouble())
			case "l":
				return try .init(.less, valueDouble: getCondDouble())
			case "r":
				return .init(.regularExpression, valueStr: conditional)
			default:
				throw Exception(
					.E10022,
					context: [
						"filterId": id as Any, "tagId": tagId,
						"typeConditional": typeConditional,
					])
			}
		}
	}

}

extension DjangoMigrationService {

	func getLabelId(_ tagId: Int64) throws -> UUID {
		guard let labelId = tagIdToLabelId.get(tagId) else {
			throw Exception(.E10021, context: ["oldTag": tagId])
		}
		return labelId
	}

	func getLabel(_ tagId: Int64) throws -> Label {
		guard let label = tagIdToLabel[tagId] else {
			throw Exception(.E10024, context: ["tagId": tagId])
		}
		return label
	}

	func migrateTagsToLabels() async throws {
		let tagsList = try await OldDb.TagModel.query(on: oldDb).all()

		let newLabels = try tagsList.map { tag in
			let tagId = try tag.requireID()
			let name = tag.name
			let label = Label(groupOwnerId: groupOwnerId, name: name)
			tagIdToLabel[tagId] = label
			return label
		}

		for label in newLabels {
			try await label.save(on: app.db)
		}

		for (key, label) in tagIdToLabel {
			tagIdToLabelId[key] = try label.requireID()
		}
	}

	private func migrateConditions(tagId: Int64, rule: Rule) async throws {
		let filters = try await OldDb.FilterModel.query(on: oldDb).filter(\.$tagId == tagId)
			.all()
		let ruleId = try rule.requireID()
		for filter in filters {
			try await rule.$conditions.create(
				.init(filter.toBaseCondition(), for: ruleId), on: app.db)
		}
	}

	func migrateTags(
		_ tagsList: [OldDb.TagModel], withDict tagToRuleDictId: inout [Int64: UUID]
	)
		async throws -> [Int64]
	{
		var newIds: [Int64] = []
		for tag in tagsList {
			let tagId = try tag.requireID()
			newIds.append(tagId)
			let rule = Rule(groupOwnerId: groupOwnerId, name: tag.name)
			if let tagParentId = tag.$parent.id {
				guard let parentRuleId = tagToRuleDictId[tagParentId] else {
					throw Exception(
						.E10025,
						context: ["tagId": tagId, "parentId": tagParentId])
				}
				rule.$parent.id = parentRuleId
			}
			try await rule.save(on: app.db)
			tagToRuleDictId[tagId] = try rule.requireID()
			try await migrateConditions(tagId: tagId, rule: rule)
			let label = try getLabel(tagId)
			try await rule.$labels.attach(label, on: app.db)
		}
		return newIds
	}

	func migrateTagsToRules() async throws {
		var tagsList = try await OldDb.TagModel.query(on: oldDb).filter(
			\.$parent.$id == nil
		).all()
		var tagToRuleDictId: [Int64: UUID] = [:]
		while !tagsList.isEmpty {
			let newIds = try await migrateTags(tagsList, withDict: &tagToRuleDictId)
			tagsList = try await OldDb.TagModel.query(on: oldDb).filter(
				\.$parent.$id ~~ newIds
			).all()
		}
	}
}

extension DjangoMigrationService.OldDb {
	final class RawDataSource: Model, @unchecked Sendable {
		struct TagsRelation {
			var tagId: Int64
			var enabled: Int8
			var automatic: Int8

			init(row: SQLRow) throws {
				tagId = try row.decode(column: "tag_id", as: Int64.self)
				enabled = try row.decode(column: "enable", as: Int8.self)
				automatic = try row.decode(
					column: "automatic", as: Int8.self)
			}
		}
		static let schema = "core_rawdatasource"

		@ID(custom: "id", generatedBy: .database)
		var id: Int64?

		@Field(key: "movement_name")
		var movementName: String

		@Field(key: "date")
		var date: Date

		@Field(key: "date_value")
		var dateValue: Date?

		@Field(key: "details")
		var details: String?

		@Field(key: "value")
		var value: Double

		@Field(key: "kind")
		var kind: String

		@Field(key: "description")
		var description: String?

		init() {}
		init(
			id: Int64? = nil, movementName: String, date: Date,
			dateValue: Date? = nil,
			details: String? = nil, value: Double, kind: String,
			description: String? = nil
		) {
			self.id = id
			self.movementName = movementName
			self.date = date
			self.dateValue = dateValue
			self.details = details
			self.value = value
			self.kind = kind
			self.description = description
		}

		func toBankTransaction(groupOwnerId: UUID) -> BankTransaction {
			let dateValue: DateOnly?
			if let _dv = self.dateValue {
				dateValue = DateOnly(_dv)
			} else {
				dateValue = nil
			}

			return BankTransaction(
				groupOwnerId: groupOwnerId, movementName: movementName,
				date: DateOnly(date), dateValue: dateValue, details: details,
				value: value, kind: kind, description: description
			)
		}

		func getRelations(on oldDb: SQLDatabase) async throws -> [TagsRelation] {
			let tableName = DjangoMigrationService.OldDb.TableNames.rdsToTags.rawValue
			let tagsList = try await oldDb.select().column(
				SQLColumn(
					SQLLiteral.all,
					table: SQLIdentifier(tableName))
			).from(
				tableName
			).where(
				SQLColumn("raw_data_source_id", table: tableName), .equal,
				SQLLiteral.numeric("\(try requireID())")
			).all()
			return try tagsList.map {
				try .init(row: $0)
			}
		}
	}
}

extension DjangoMigrationService {

	private func migrateTransaction(rds: OldDb.RawDataSource) async throws {
		let transaction = rds.toBankTransaction(groupOwnerId: groupOwnerId)
		try await transaction.save(on: app.db)
		let tags = try await rds.getRelations(on: oldSqlDb)
		for oldTag in tags {
			let labelId = try getLabelId(oldTag.tagId)
			let linkReason: LabelTransitionReason
			switch (oldTag.enabled, oldTag.automatic) {
			case (0, _):
				linkReason = .manualDisabled
			case (1, 0):
				linkReason = .manualEnabled
			default:
				linkReason = .automatic
			}
			let newRelation = LabelTransaction(
				labelId: labelId, transactionId: try transaction.requireID(),
				linkReason: linkReason)
			try await newRelation.save(on: app.db)
		}
	}

	func migrateTransactions() async throws {
		let transactionsQuery = OldDb.RawDataSource.query(on: oldDb).sort(.id)

		var finish = false
		var pageIdx = 1
		var done = 0
		while !finish {
			let page = try await transactionsQuery.page(
				withIndex: pageIdx, size: DjangoMigrationService.PAGE_SIZE)
			pageIdx = page.metadata.page + 1
			finish = pageIdx > page.metadata.pageCount
			for rds in page.items {
				try await migrateTransaction(rds: rds)
				done = done + 1
			}
			print("Migrated \(done)/\(page.metadata.total)")
		}
	}
}

extension DjangoMigrationService.OldDb {
	final class Graph: Model, @unchecked Sendable {
		static var schema = "graphs_graphv2"

		@ID(custom: "id", generatedBy: .database)
		var id: Int64?

		@Field(key: "name")
		var name: String

		@Field(key: "kind")
		var kind: String

		@Field(key: "tag_filter_id")
		var tagFilter: Int64?

		@Field(key: "date_range")
		var dateRange: String

		func getKindEnum() throws -> GraphKind {
			switch kind {
			case "pie":
				return .pie
			case "bar":
				return .bar
			case "line":
				return .line
			default:
				throw Exception(
					.E10027, context: ["graphId": id as Any, "kind": kind])
			}
		}

		func getDateRangeEnum() throws -> GraphDateRange {
			switch dateRange {
			case "all":
				return .all
			case "six":
				return .halfYear
			case "month":
				return .oneMonth
			case "year":
				return .oneYear
			case "sixYears":
				return .sixYears
			case "twoYears":
				return .twoYears
			default:
				throw Exception(
					.E10028,
					context: ["graphId": id as Any, "dateRange": dateRange])
			}
		}
	}

	struct GraphGroup {
		var id: Int64
		var graphId: Int64
		var group: String
		var hideOthers: Bool?
		var accumulate: Bool?

		init(row: SQLRow) throws {
			id = try row.decode(column: "id", as: Int64.self)
			graphId = try row.decode(column: "graph_id", as: Int64.self)
			group = try row.decode(column: "group", as: String.self)
			hideOthers = try row.decode(column: "hide_others")

			if row.contains(column: "accumulate") {
				accumulate = try row.decode(column: "accumulate")
			}
		}

		func getGroupType() throws -> GraphGroupType {
			switch group {
			case "day":
				return .day
			case "month":
				return .month
			case "year":
				return .year
			case "tags":
				return .labels
			case "sign":
				return .sign
			default:
				throw Exception(.E10026, context: ["group": group])
			}
		}

		static func query(table: TableNames, for graphId: Int64, on db: SQLDatabase)
			async throws -> GraphGroup?
		{
			let tableName = table.rawValue
			let groupsList = try await db.select().column(
				SQLColumn(
					SQLLiteral.all,
					table: SQLIdentifier(tableName))
			).from(
				tableName
			).where(
				SQLColumn("graph_id", table: tableName), .equal,
				SQLLiteral.numeric("\(graphId)")
			).all()
			if groupsList.count > 1 {
				throw Exception(
					.E10029,
					context: [
						"graphId": graphId,
						"found elements": groupsList.count,
					])
			}
			guard let row = groupsList.first else {
				return nil
			}
			return try .init(row: row)
		}

	}

	struct GraphGroupTag {
		var groupId: Int64
		var tagId: Int64

		init(row: SQLRow) throws {
			groupId = try row.decode(column: "group_id", as: Int64.self)
			tagId = try row.decode(column: "tag_id", as: Int64.self)
		}

		static func query(table: TableNames, for groupId: Int64, on db: SQLDatabase)
			async throws -> [GraphGroupTag]
		{
			let tableName = table.rawValue
			let groupsList = try await db.select().column(
				SQLColumn(
					SQLLiteral.all,
					table: SQLIdentifier(tableName))
			).from(
				tableName
			).where(
				SQLColumn("group_id", table: tableName), .equal,
				SQLLiteral.numeric("\(groupId)")
			).orderBy(SQLColumn("id")).all()

			return try groupsList.map { try .init(row: $0) }
		}
	}
}

extension DjangoMigrationService {
	private func migrateGraph(graph oldGraph: OldDb.Graph) async throws {
		let labelFilterId: UUID?
		if let tagFilter = oldGraph.tagFilter {
			labelFilterId = try getLabelId(tagFilter)
		} else {
			labelFilterId = nil
		}
		let oldGraphId = try oldGraph.requireID()
		let graph = try Graph(
			groupOwnerId: groupOwnerId, name: oldGraph.name,
			kind: oldGraph.getKindEnum(),
			labelFilterId: labelFilterId,
			dateRange: oldGraph.getDateRangeEnum())

		try await graph.save(on: app.db)
		let graphId = try graph.requireID()

		let oldGroup = try await OldDb.GraphGroup.query(
			table: .graphGroup, for: oldGraphId, on: oldSqlDb)
		guard let oldGroup else {
			throw Exception(.E10030, context: ["oldGraphId": oldGraphId])
		}
		let group = try GraphGroup(
			graphId: graphId, group: oldGroup.getGroupType(),
			hideOthers: oldGroup.hideOthers)
		try await group.save(on: app.db)

		let oldGroupTags = try await OldDb.GraphGroupTag.query(
			table: .graphGroupTag, for: oldGroup.id, on: oldSqlDb)
		let groupLabels: [GraphGroupLabels] = try oldGroupTags.map {
			.init(graphId: graphId, labelId: try getLabelId($0.tagId), order: $1)
		}
		for groupLabel in groupLabels {
			try await groupLabel.save(on: app.db)
		}

		let oldHorizontalGroup = try await OldDb.GraphGroup.query(
			table: .graphHorizontalGroup, for: oldGraphId, on: oldSqlDb)
		if let oldHorizontalGroup {
			let horizontalGroup = GraphHorizontalGroup(
				graphId: graphId, group: try oldHorizontalGroup.getGroupType(),
				hideOthers: oldHorizontalGroup.hideOthers,
				accumulate: oldHorizontalGroup.accumulate ?? false)
			try await horizontalGroup.save(on: app.db)

			let oldHorizontalGroupTags = try await OldDb.GraphGroupTag.query(
				table: .graphHorizontalGroupTag, for: oldGroup.id, on: oldSqlDb)
			let horizontalGroupLabels: [GraphHorizontalGroupLabels] =
				try oldHorizontalGroupTags.map {
					.init(
						graphId: graphId, labelId: try getLabelId($0.tagId),
						order: $1)
				}
			for groupLabel in horizontalGroupLabels {
				try await groupLabel.save(on: app.db)
			}
		}
	}
	func migrateGraphs() async throws {
		let graphs = try await OldDb.Graph.query(on: oldDb).all()
		for graph in graphs {
			try await migrateGraph(graph: graph)
		}
	}
}

public struct Counter {
	var count: Int = 0
	public init() {}
	@usableFromInline mutating func next() -> Int {
		count = count + 1
		return count
	}
}

extension Array {
	@inlinable public func map<T>(_ transform: (Element, Int) throws -> T)
		throws -> [T]
	{
		var counter = Counter()
		return try map { try transform($0, counter.next()) }
	}
}
