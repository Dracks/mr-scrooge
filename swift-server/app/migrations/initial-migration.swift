import Fluent

struct InitialMigration: AsyncMigration {
	func prepare(on database: Database) async throws {
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

		try await database.schema("user_groups")
			.id()
			.field("name", .string, .required)
			.field("created_at", .datetime)
			.field("updated_at", .datetime)
			.create()

		try await database.schema("user_group_pivot")
			.id()
			.field("user_id", .uuid, .required, .references("users", "id"))
			.field("group_id", .uuid, .required, .references("user_groups", "id"))
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
			.field("description", .string)
			.create()

		try await database.schema("core_condition")
			.id()
			.field("name", .string, .required)
			.create()

		try await database.schema("core_rule")
			.id()
			.field("group_owner_id", .uuid, .required, .references("user_groups", "id"))
			.field("name", .string, .required)
			.field("conditions_relation", .string, .required)
			.field("parent", .uuid, .references("core_rule", "id"))
			.create()

		try await database.schema("graph_graph")
			.id()
			.field("group_owner_id", .uuid, .required, .references("user_groups", "id"))
			.field("name", .string, .required)
			.field("kind", .string, .required)
			.field("label_filter", .uuid, .references("graph_label", "id"))
			.field("date_range", .string, .required)
			.create()

		try await database.schema("graph_group")
			.field(
				"graph_id", .uuid, .required, .references("graph_graph", "id"),
				.identifier(auto: false)
			)
			.field("group", .string, .required)
			.field("hide_others", .bool)
			.unique(on: "graph_id")
			.create()

		try await database.schema("graph_horizontal_group")
			.field(
				"graph_id", .uuid, .required, .references("graph_graph", "id"),
				.identifier(auto: false)
			)
			.field("group", .string, .required)
			.field("hide_others", .bool)
			.field("accumulate", .bool, .required)

			.create()

		try await database.schema("graph_group_labels")
			.id()
			.field("graph_id", .uuid, .required, .references("graph_group", "graph_id"))
			.field("label_id", .uuid, .required, .references("graph_label", "id"))
			.field("order", .int64)
			.unique(on: "graph_id", "label_id")
			.create()

		try await database.schema("graph_horizontal_group_labels")
			.id()
			.field(
				"graph_id", .uuid, .required,
				.references("graph_horizontal_group", "graph_id")
			)
			.field("label_id", .uuid, .required, .references("graph_label", "id"))
			.field("order", .int64)
			.unique(on: "graph_id", "label_id")
			.create()

		try await database.schema("graph_label")
			.id()
			.field("group_owner_id", .uuid, .required, .references("user_groups", "id"))
			.field("name", .string, .required)
			.create()

		try await database.schema("graph_label_transaction")
			.id()
			.field("label_id", .uuid, .required, .references("graph_label", "id"))
			.field(
				"transaction_id", .uuid, .required,
				.references("core_bank_transaction", "id")
			)
			.create()

		try await database.schema("status_report")
			.id()
			.field("description", .string, .required)
			.field("file_name", .string, .required)
			.field("group_owner_id", .uuid, .required, .references("user_groups", "id"))
			.field("kind", .string, .required)
			.field("status", .string, .required)
			.field("stack", .string)
			.field("context", .string)
			.create()

		try await database.schema("status_report_row")
			.id()
			.field("report_id", .uuid, .required, .references("status_report", "id"))
			.field("movement_name", .string, .required)
			.field("date", .date, .required)
			.field("date_value", .date)
			.field("details", .string)
			.field("value", .double, .required)
			.field("description", .string)
			.field("message", .string)
			.field("transaction_id", .uuid)
			.create()
	}

	func revert(on database: Database) async throws {
		try await database.schema("status_report_row").delete()
		try await database.schema("status_report").delete()
		try await database.schema("graph_label_transaction").delete()
		try await database.schema("graph_label").delete()
		try await database.schema("graph_horizontal_group_labels").delete()
		try await database.schema("graph_group_labels").delete()
		try await database.schema("graph_horizontal_group").delete()
		try await database.schema("graph_group").delete()
		try await database.schema("graph_graph").delete()
		try await database.schema("core_rule").delete()
		try await database.schema("core_condition").delete()
		try await database.schema("core_bank_transaction").delete()
		try await database.schema("user_group_pivot").delete()
		try await database.schema("user_groups").delete()
		try await database.schema("users").delete()
	}
}
