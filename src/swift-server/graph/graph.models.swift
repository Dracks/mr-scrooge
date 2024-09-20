import Fluent
import Vapor

enum GraphKind: String, Codable, CaseIterable {
	case bar = "bar"
	case line = "line"
	case pie = "pie"
}

enum GraphGroupType: String, Codable, CaseIterable {
	case day = "day"
	case labels = "labels"
	case month = "month"
	case sign = "sign"
	case year = "year"
}

enum GraphDateRange: String, Codable, CaseIterable {
	case all = "all"
	case halfYear = "six"
	case oneMonth = "month"
	case oneYear = "year"
	case sixYears = "sixYears"
	case twoYears = "twoYears"
}

final class Graph: Model, Content, @unchecked Sendable {
	static let schema = "graph_graph"

	@ID(key: .id)
	var id: UUID?

	@Parent(key: "group_owner_id")
	var groupOwner: UserGroup

	@Field(key: "name")
	var name: String

	@Enum(key: "kind")
	var kind: GraphKind

	@OptionalParent(key: "label_filter")
	var labelFilter: Label?

	@Enum(key: "date_range")
	var dateRange: GraphDateRange

	@OptionalChild(for: \.$graph)
	var group: GraphGroup?

	@OptionalChild(for: \.$graph)
	var horizontalGroup: GraphHorizontalGroup?

	init() {}

	init(
		id: UUID? = nil, groupOwnerId: UserGroup.IDValue, name: String, kind: GraphKind,
		labelFilterId: Label.IDValue? = nil, dateRange: GraphDateRange
	) {
		self.id = id
		self.$groupOwner.id = groupOwnerId
		self.name = name
		self.kind = kind
		self.$labelFilter.id = labelFilterId
		self.dateRange = dateRange
	}
}

protocol AbstractGroup: Model, Content {
	var graph: Graph { get set }
	var group: GraphGroupType { get set }
	var hideOthers: Bool? { get set }
}

final class GraphGroup: Model, Content, AbstractGroup, @unchecked Sendable {

	static let schema = "graph_group"

	@ID(custom: "graph_id")
	var id: UUID?

	@Parent(key: "graph_id")
	var graph: Graph

	@Enum(key: "group")
	var group: GraphGroupType

	@Field(key: "hide_others")
	var hideOthers: Bool?

	init() {}

	init(graphId: Graph.IDValue, group: GraphGroupType, hideOthers: Bool? = nil) {
		self.$graph.id = graphId
		self.group = group
		self.hideOthers = hideOthers
	}
}

final class GraphHorizontalGroup: Model, Content, AbstractGroup, @unchecked Sendable {

	static let schema = "graph_horizontal_group"

	@ID(custom: "graph_id")
	var id: UUID?

	@Parent(key: "graph_id")
	var graph: Graph

	@Enum(key: "group")
	var group: GraphGroupType

	@Field(key: "hide_others")
	var hideOthers: Bool?

	@Field(key: "accumulate")
	var accumulate: Bool

	init() {}

	init(
		graphId: Graph.IDValue, group: GraphGroupType, hideOthers: Bool? = nil,
		accumulate: Bool = false
	) {
		self.$graph.id = graphId
		self.group = group
		self.hideOthers = hideOthers
		self.accumulate = accumulate
	}
}
final class GraphGroupLabels: Model, Content, @unchecked Sendable {
	static let schema = "graph_group_labels"

	@ID(custom: "graph_id")
	var id: UUID?

	@Parent(key: "graph_id")
	var graph: GraphGroup

	@Parent(key: "label_id")
	var label: Label

	@Field(key: "order")
	var order: Int

	init() {}

	init(graphId: GraphGroup.IDValue, labelId: Label.IDValue, order: Int) {
		self.$graph.id = graphId
		self.$label.id = labelId
		self.order = order
	}
}

final class GraphHorizontalGroupLabels: Model, Content, @unchecked Sendable {
	static let schema = "graph_horizontal_group_labels"

	@ID(custom: "graph_id")
	var id: UUID?

	@Parent(key: "graph_id")
	var graph: GraphHorizontalGroup

	@Parent(key: "label_id")
	var label: Label

	@Field(key: "order")
	var order: Int

	init() {}

	init(graphId: GraphHorizontalGroup.IDValue, labelId: Label.IDValue, order: Int) {
		self.$graph.id = graphId
		self.$label.id = labelId
		self.order = order
	}
}
