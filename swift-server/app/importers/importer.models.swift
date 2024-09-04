import Fluent
import Vapor

final class StatusReport: Model {
    static let schema = "status_report"

    @ID(key: .id)
    var id: UUID?

    @Field(key: "description")
    var description: String

    @Field(key: "file_name")
    var fileName: String

    @Field(key: "group_owner_id")
    var groupOwnerId: UUID

    @Field(key: "kind")
    var kind: String

    @Field(key: "status")
    var status: String

    @OptionalField(key: "stack")
    var stack: String?

    @OptionalField(key: "context")
    var context: String?

    init() { }

    init(id: UUID? = nil, description: String, fileName: String, groupOwnerId: UUID, kind: String, status: String) {
        self.id = id
        self.description = description
        self.fileName = fileName
        self.groupOwnerId = groupOwnerId
        self.kind = kind
        self.status = status
    }
}

final class StatusReportRow: Model {
    static let schema = "status_report_row"

    @ID(key: .id)
    var id: UUID?

    @Parent(key: "report_id")
    var report: StatusReport

    @Field(key: "movement_name")
    var movementName: String

    @Field(key: "date")
    var date: DateOnly

    @OptionalField(key: "date_value")
    var dateValue: DateOnly?

    @OptionalField(key: "details")
    var details: String?

    @Field(key: "value")
    var value: Double

    @OptionalField(key: "description")
    var description: String?

    @OptionalField(key: "message")
    var message: String?

    @OptionalField(key: "transaction_id")
    var transactionId: UUID?

    init() { }

    init(id: UUID? = nil, reportId: UUID, movementName: String, date: DateOnly, dateValue: DateOnly? = nil, details: String? = nil, value: Double, description: String? = nil) {
        self.id = id
        self.$report.id = reportId
        self.movementName = movementName
        self.date = date
        self.dateValue = dateValue
        self.details = details
        self.value = value
        self.description = description
    }
}
