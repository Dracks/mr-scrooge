import Fluent
import Vapor
import XCTVapor
import XCTest

@testable import App

final class CaixaEnginyersImporterTests: XCTestCase {
    var importerService: NewImportService!
    var bankTransactionService: BankTransactionService!
    var statusReportsService: StatusReportsService!
    var group: UserGroup!
    var app: Application?
    
    func getTestFile(file: String ) -> String {
        let pwd = URL(fileURLWithPath: #file).pathComponents
            .prefix(while: { $0 != "importers" }).joined(separator: "/").dropFirst()
        return "\(pwd)/\(file)"
    }

    override func setUp() async throws {
        let app = try await Application.make(.testing)
        try await configure(app)
        self.app = app

        self.group = UserGroup(name: "Test User Group")
        try await self.group.save(on: app.db)

        let testParsers: [ParserFactory] = [CaixaEnginyersAccountImporter(), CaixaEnginiersCreditImporter()]
        importerService = NewImportService(parsers: testParsers)
        bankTransactionService = BankTransactionService()
        statusReportsService = StatusReportsService()
    }

    override func tearDown() async throws {
        try await self.app?.asyncShutdown()
        self.app = nil
    }

    func getDb() throws -> Database {
        guard let app = app else {
            throw TestError()
        }
        return app.db
    }

    func testCaixaEnginyersAccountImport() async throws {
        let groupOwnerId = try self.group.requireID()
        let db = try getDb()
        
        let filePath = getTestFile(file: "test_files/MovimientosCuenta.xls")

        
        try await importerService.importFromFile(
            on: db, groupOwnerId: groupOwnerId, key: "caixa-enginyers/account",
            fileName: "MovimientosCuenta.xls", filePath: filePath)

        let reports = try await statusReportsService.getAll(on: db, groupIds: [groupOwnerId])
        XCTAssertEqual(reports.list.count, 1)
        XCTAssertEqual(reports.list.first?.status, "OK")

        let transactions = try await bankTransactionService.getAll(on: db, groupIds: [groupOwnerId])
        XCTAssertEqual(transactions.list.count, 4)

       	// Check specific transactions
		let august4Transaction = transactions.list.first { $0.date == DateOnly("2019-08-04") }
		XCTAssertNotNil(august4Transaction)
		XCTAssertEqual(august4Transaction?.value, 1500)
		XCTAssertEqual(august4Transaction?.movementName, "Dr Who")
		XCTAssertEqual(august4Transaction?.details, "Transfer")

		let november9Transaction = transactions.list.first { $0.date == DateOnly("2019-11-09") }
		XCTAssertNotNil(november9Transaction)
		XCTAssertEqual(november9Transaction?.value, -2.88)
		XCTAssertEqual(november9Transaction?.movementName, "OPERACIÓ VIKINI")
		XCTAssertEqual(november9Transaction?.details, "TARGETA *5019")

		let october8Transaction = transactions.list.first { $0.date == DateOnly("2019-10-08") }
		XCTAssertNotNil(october8Transaction)
		XCTAssertEqual(october8Transaction?.value, -120)
		XCTAssertEqual(october8Transaction?.movementName, "AI DIOS NOS AYUDE")
		XCTAssertEqual(october8Transaction?.details, "Bill")
    }
    
    

    func testCaixaEnginiersCreditImport() async throws {
        let groupOwnerId = try self.group.requireID()
        let db = try getDb()
        
        let filePath = getTestFile(file: "test_files/MovimientosTarjetaCredito.xls")
        
        try await importerService.importFromFile(
            on: db, groupOwnerId: groupOwnerId, key: "caixa-enginyers/credit",
            fileName: "MovimientosTarjetaCredito.xls", filePath: filePath)

        let reports = try await statusReportsService.getAll(on: db, groupIds: [groupOwnerId])
        XCTAssertEqual(reports.list.count, 1)
        XCTAssertEqual(reports.list.first?.status, "OK")
        XCTAssertEqual(reports.list.first?.description, "")
        XCTAssertNil(reports.list.first?.context)

        let transactions = try await bankTransactionService.getAll(on: db, groupIds: [groupOwnerId])
        XCTAssertEqual(transactions.list.count, 1)

        // Test specific transaction details
        let transaction = transactions.list.first
        XCTAssertNotNil(transaction)
        XCTAssertEqual(transaction?.date, DateOnly("2018-05-12"))
        XCTAssertEqual(transaction?.value, -5.31)
        XCTAssertEqual(transaction?.movementName, "PAYPAL *SOMEHOBBY")
    }

    func testCaixaEnginyersAccountSplitMessage() async throws {
        let importer = CaixaEnginyersAccountImporter()
        
        let (details1, movementName1) = importer.splitMessage("R/ Some bill")
        XCTAssertEqual(details1, "Bill")
        XCTAssertEqual(movementName1, "Some bill")

        let (details2, movementName2) = importer.splitMessage("TRANSF: Some transfer")
        XCTAssertEqual(details2, "Transfer")
        XCTAssertEqual(movementName2, "Some transfer")

        let (details3, movementName3) = importer.splitMessage("TARGETA *1234 Some card transaction")
        XCTAssertEqual(details3, "TARGETA *1234")
        XCTAssertEqual(movementName3, "Some card transaction")

        let (details4, movementName4) = importer.splitMessage("Regular transaction")
        XCTAssertEqual(details4, "")
        XCTAssertEqual(movementName4, "Regular transaction")
    }
 
}

