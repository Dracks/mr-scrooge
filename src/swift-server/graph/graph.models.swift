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
	case twoYears = "twoYears"
	case sixYears = "sixYears"
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

	@Field(key: "order")
	var order: Int

	@OptionalChild(for: \.$id.$parent)
	var group: GraphGroup?

	@OptionalChild(for: \.$id.$parent)
	var horizontalGroup: GraphHorizontalGroup?

	init() {}

	init(
		id: UUID? = nil, groupOwnerId: UserGroup.IDValue, name: String, kind: GraphKind,
		labelFilterId: Label.IDValue? = nil, dateRange: GraphDateRange, order: Int
	) {
		self.id = id
		self.$groupOwner.id = groupOwnerId
		self.name = name
		self.kind = kind
		self.$labelFilter.id = labelFilterId
		self.dateRange = dateRange
		self.order = order
	}
}
/*
protocol AbstractGroup: Model, Content {
	var graph: Graph { get set }
	var group: GraphGroupType { get set }
	var hideOthers: Bool? { get set }
}

protocol AbstractGroupLabels: Content {

	init(graphId: Graph.IDValue, labelId: Label.IDValue, order: Int)
}
*/

final class GraphGroup: Model, Content, @unchecked Sendable {

	static let schema = "graph_group"

	final class IDValue: Fields, Hashable, @unchecked Sendable {
		@Parent(key: "graph_id")
		var parent: Graph

		init() {}

		init(parentId: Graph.IDValue) {
			self.$parent.id = parentId
		}

		static func == (lhs: IDValue, rhs: IDValue) -> Bool {
			lhs.$parent.id == rhs.$parent.id
		}

		func hash(into hasher: inout Hasher) {
			hasher.combine(self.$parent.id)
		}
	}

	@CompositeID
	var id: IDValue?

	@Enum(key: "group")
	var group: GraphGroupType

	@Field(key: "hide_others")
	var hideOthers: Bool?

	init() {}

	init(graphId: Graph.IDValue, group: GraphGroupType, hideOthers: Bool? = nil) {
		self.id = .init(parentId: graphId)
		self.group = group
		self.hideOthers = hideOthers
	}
}

final class GraphHorizontalGroup: Model, Content, @unchecked Sendable {

	static let schema = "graph_horizontal_group"

	final class IDValue: Fields, Hashable, @unchecked Sendable {
		@Parent(key: "graph_id")
		var parent: Graph

		init() {}

		init(parentId: Graph.IDValue) {
			self.$parent.id = parentId
		}

		static func == (lhs: IDValue, rhs: IDValue) -> Bool {
			lhs.$parent.id == rhs.$parent.id
		}

		func hash(into hasher: inout Hasher) {
			hasher.combine(self.$parent.id)
		}
	}

	@CompositeID
	var id: IDValue?

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
		self.id = .init(parentId: graphId)
		self.group = group
		self.hideOthers = hideOthers
		self.accumulate = accumulate
	}
}

final class GraphGroupLabels: Model, Content, @unchecked Sendable {
	static let schema = "graph_group_labels"

	final class IDValue: Fields, Hashable, @unchecked Sendable {
		@Parent(key: "graph_id")
		var graph: Graph

		@Parent(key: "label_id")
		var label: Label

		init() {}

		init(graphId: Graph.IDValue, labelId: Label.IDValue) {
			self.$graph.id = graphId
			self.$label.id = labelId
		}

		static func == (lhs: IDValue, rhs: IDValue) -> Bool {
			lhs.$graph.id == rhs.$graph.id && lhs.$label.id == rhs.$label.id
		}

		func hash(into hasher: inout Hasher) {
			hasher.combine(self.$graph.id)
			hasher.combine(self.$label.id)
		}
	}

	@CompositeID
	var id: IDValue?

	@Field(key: "order")
	var order: Int

	init() {}

	init(graphId: Graph.IDValue, labelId: Label.IDValue, order: Int) {
		self.id = .init(graphId: graphId, labelId: labelId)
		self.order = order
	}
}

final class GraphHorizontalGroupLabels: Model, Content, @unchecked Sendable {
	static let schema = "graph_horizontal_group_labels"

	final class IDValue: Fields, Hashable, @unchecked Sendable {
		@Parent(key: "graph_id")
		var graph: Graph

		@Parent(key: "label_id")
		var label: Label

		init() {}

		init(graphId: Graph.IDValue, labelId: Label.IDValue) {
			self.$graph.id = graphId
			self.$label.id = labelId
		}

		static func == (lhs: IDValue, rhs: IDValue) -> Bool {
			lhs.$graph.id == rhs.$graph.id && lhs.$label.id == rhs.$label.id
		}

		func hash(into hasher: inout Hasher) {
			hasher.combine(self.$graph.id)
			hasher.combine(self.$label.id)
		}
	}

	@CompositeID
	var id: IDValue?

	@Field(key: "order")
	var order: Int

	init() {}

	init(graphId: Graph.IDValue, labelId: Label.IDValue, order: Int) {
		self.id = .init(graphId: graphId, labelId: labelId)
		self.order = order
	}
}
