import Fluent
import FluentSQL

struct InitialMigration: AsyncMigration {
	func prepare(on database: Database) async throws {
		let sqlDb = database as? SQLDatabase
		let labelTransactionLinkReasonEnum = try await database.enum(
			"label_transaction_link_reason"
		)
		.case("manualEnabled")
		.case("manualDisabled")
		.case("automatic")
		.create()

		let conditionsRelationEnum = try await database.enum("conditions_relation")
			.case("notAnd")
			.case("or")
			.create()

		let operationEnum = try await database.enum("operation")
			.case("prefix")
			.case("regularExpression")
			.case("suffix")
			.case("contains")
			.case("greater")
			.case("greaterEqual")
			.case("less")
			.case("lessEqual")
			.create()

		let graphKindEnum = try await database.enum("graph_kind")
			.case("bar")
			.case("line")
			.case("pie")
			.create()

		let dateRangeEnum = try await database.enum("date_range")
			.case("all")
			.case("six")
			.case("month")
			.case("year")
			.case("twoYears")
			.case("sixYears")
			.create()

		let groupEnum = try await database.enum("graph_group_type")
			.case("day")
			.case("labels")
			.case("month")
			.case("sign")
			.case("year")
			.create()

		let importStatusEnum = try await database.enum("import_status")
			.case("ok")
			.case("warn")
			.case("error")
			.create()

		try await database.schema("user_groups")
			.id()
			.field("name", .string, .required)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.create()

		try await database.schema("users")
			.id()
			.field("username", .string, .required)
			.field("password_hash", .string, .required)
			.field("email", .string, .required)
			.field("first_name", .string)
			.field("last_name", .string)
			.field("is_active", .bool, .required)
			.field("is_superuser", .bool, .required)
			.field(
				"default_group_id", .uuid, .required,
				.references("user_groups", "id")
			)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.unique(on: "username")
			.unique(on: "email")
			.create()

		try await database.schema("user_group_pivot")
			.id()
			.field("user_id", .uuid, .required, .references("users", "id"))
			.field("group_id", .uuid, .required, .references("user_groups", "id"))
			.unique(on: "user_id", "group_id")
			.create()

		try await database.schema("core_bank_transaction")
			.id()
			.field("group_owner_id", .uuid, .required, .references("user_groups", "id"))
			.field("movement_name", .string, .required)
			.field("date", .date, .required)
			.field("date_value", .date)
			.field("details", .string)
			.field("value", .double, .required)
			.field("kind", .string, .required)
			.field("comment", .string)
			.create()

		try await sqlDb?.create(index: "group_owner_idx")
			.on("core_bank_transaction")
			.column("group_owner_id")
			.run()

		try await database.schema("core_label")
			.id()
			.field("group_owner_id", .uuid, .required, .references("user_groups", "id"))
			.field("name", .string, .required)
			.create()

		try await database.schema("core_label_transaction")
			.id()
			.field("label_id", .uuid, .required, .references("core_label", "id"))
			.field(
				"transaction_id", .uuid, .required,
				.references("core_bank_transaction", "id")
			)
			.field("link_reason", labelTransactionLinkReasonEnum, .required)
			.unique(on: "label_id", "transaction_id")
			.create()
		try await sqlDb?.create(index: "label_transaction_transaction_idx")
			.on("core_label_transaction")
			.column("transaction_id")
			.run()

		try await database.schema("core_rule")
			.id()
			.field("group_owner_id", .uuid, .required, .references("user_groups", "id"))
			.field("name", .string, .required)
			.field("conditions_relation", conditionsRelationEnum, .required)
			.field("parent_id", .uuid, .references("core_rule", "id"))
			.create()
		try await sqlDb?.create(index: "core_rule_group_owner_idx")
			.on("core_rule")
			.column("group_owner_id")
			.run()

		try await database.schema("core_condition")
			.id()
			.field("rule_id", .uuid, .required, .references("core_rule", "id"))
			.field("operation", operationEnum, .required)
			.field("value_str", .string)
			.field("value_double", .double)
			.create()
		try await sqlDb?.create(index: "core_condition_rule_idx")
			.on("core_condition")
			.column("rule_id")
			.run()

		try await database.schema("core_rule_label_action")
			.id()
			.field("rule_id", .uuid, .required, .references("core_rule", "id"))
			.field("label_id", .uuid, .required, .references("core_label", "id"))
			.unique(on: "rule_id", "label_id")
			.create()

		try await sqlDb?.create(index: "core_rule_label_action_label_idx")
			.on("core_rule_label_action")
			.column("label_id")
			.run()

		try await database.schema("core_rule_label_pivot")
			.id()
			.field(
				"rule_label_id", .uuid, .required,
				.references("core_rule_label_action", "id")
			)
			.field(
				"label_transaction_id", .uuid, .required,
				.references("core_label_transaction", "id")
			)
			.unique(on: "rule_label_id", "label_transaction_id")
			.create()

		try await database.schema("graph_graph")
			.id()
			.field("group_owner_id", .uuid, .required, .references("user_groups", "id"))
			.field("name", .string, .required)
			.field("kind", graphKindEnum, .required)
			.field("label_filter", .uuid, .references("core_label", "id"))
			.field("date_range", dateRangeEnum, .required)
			// Postgres doesn't support uint
			.field("order", .int64)
			.create()

		try await sqlDb?.create(index: "graph_graph_group_owner_idx")
			.on("graph_graph")
			.column("group_owner_id")
			.run()

		try await database.schema("graph_group")
			.field(
				"graph_id", .uuid, .required, .references("graph_graph", "id"),
				.identifier(auto: false)
			)
			.field("group", groupEnum, .required)
			.field("hide_others", .bool)
			.create()

		try await database.schema("graph_horizontal_group")
			.field(
				"graph_id", .uuid, .required, .references("graph_graph", "id"),
				.identifier(auto: false)
			)
			.field("group", groupEnum, .required)
			.field("hide_others", .bool)
			.field("accumulate", .bool, .required)
			.create()

		try await database.schema("graph_group_labels")
			.field(
				"graph_id", .uuid, .required,
				.references("graph_group", "graph_id")
			)
			.field("label_id", .uuid, .required, .references("core_label", "id"))
			.field("order", .int64)
			.compositeIdentifier(over: "graph_id", "label_id")
			.create()

		try await database.schema("graph_horizontal_group_labels")
			.field(
				"graph_id", .uuid, .required,
				.references("graph_horizontal_group", "graph_id")
			)
			.field("label_id", .uuid, .required, .references("core_label", "id"))
			.field("order", .int64)
			.compositeIdentifier(over: "graph_id", "label_id")
			.create()

		try await database.schema("import_fileimport")
			.id()
			.field("description", .string, .required)
			.field("file_name", .string, .required)
			.field("group_owner_id", .uuid, .required, .references("user_groups", "id"))
			// when problems look at the answer of Gwynne
			// https://discord.com/channels/431917998102675485/684159753189982218/1282405735455522950
			.field("created_at", .datetime, .required)
			.field("kind", .string, .required)
			.field("status", importStatusEnum, .required)
			.field("stack", .string)
			.field("context", .string)
			.create()
		try await sqlDb?.create(index: "import_fileimport_group_owner_idx")
			.on("import_fileimport")
			.column("group_owner_id")
			.run()

		try await database.schema("import_fileimport_row")
			.id()
			.field(
				"report_id", .uuid, .required,
				.references("import_fileimport", "id")
			)
			.field("movement_name", .string, .required)
			.field("date", .date, .required)
			.field("date_value", .date)
			.field("details", .string)
			.field("value", .double, .required)
			.field("description", .string)
			.field("message", .string)
			.field("transaction_id", .uuid)
			.create()

		try await sqlDb?.create(index: "import_fileimport_row_report_idx")
			.on("import_fileimport_row")
			.column("report_id")
			.run()

	}

	func revert(on database: Database) async throws {
		try await database.schema("import_fileimport_row").delete()
		try await database.schema("import_fileimport").delete()
		try await database.schema("graph_horizontal_group_labels").delete()
		try await database.schema("graph_group_labels").delete()
		try await database.schema("graph_horizontal_group").delete()
		try await database.schema("graph_group").delete()
		try await database.schema("graph_graph").delete()
		try await database.schema("core_rule_label_pivot").delete()
		try await database.schema("core_rule_label_action").delete()
		try await database.schema("core_condition").delete()
		try await database.schema("core_rule").delete()
		try await database.schema("core_label_transaction").delete()
		try await database.schema("core_label").delete()
		try await database.schema("core_bank_transaction").delete()
		try await database.schema("user_group_pivot").delete()
		try await database.schema("users").delete()
		try await database.schema("user_groups").delete()

		try await database.enum("import_status").delete()
		try await database.enum("graph_group_type").delete()
		try await database.enum("date_range").delete()
		try await database.enum("graph_kind").delete()
		try await database.enum("operation").delete()
		try await database.enum("conditions_relation").delete()
		try await database.enum("label_transaction_link_reason").delete()
	}
}
