import Fluent
import Queues
import Vapor
import swift_macros

class ServiceWithDb {
	let db: Database
	init(app: Application) {
		db = app.db
	}
}

class ServiceWithQueueAndDb: ServiceWithDb {
	let queue: Queue

	override init(app: Application) {
		queue = app.queues.queue
		super.init(app: app)
	}
}

extension UserService: StorageKey {
	typealias Value = UserService
}

extension UserGroupService: StorageKey {
	typealias Value = UserGroupService
}

extension BankTransactionService: StorageKey {
	typealias Value = BankTransactionService
}

extension LabelService: StorageKey {
	typealias Value = LabelService
}

extension RuleService: StorageKey {
	typealias Value = RuleService
}

extension FileImportService: StorageKey {
	typealias Value = FileImportService
}

extension GraphService: StorageKey {
	typealias Value = GraphService
}

extension Application {
	@ServiceDependency()
	var userService: UserService

	@ServiceDependency()
	var userGroupService: UserGroupService

	@ServiceDependency()
	var bankTransactionService: BankTransactionService

	@ServiceDependency()
	var ruleService: RuleService

	@ServiceDependency()
	var fileImportService: FileImportService

	@ServiceDependency()
	var graphService: GraphService

	@ServiceDependency()
	var labelService: LabelService
}
