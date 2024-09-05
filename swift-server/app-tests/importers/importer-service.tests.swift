import XCTest
import Fluent
import Vapor
import XCTVapor

@testable import App

final class ImporterServiceTests: XCTestCase {
    var importerService: NewImportService!
    var bankTransactionService: BankTransactionService!
    var statusReportsService: StatusReportsService!
    var group: UserGroup!
    var app: Application?

    
    override func setUp() async throws {
        // let testParsers: [ParserFactory] = [TestBasicImporter(), N26Importer(), CommerzBankEnImporter()]
        
        let app = try await Application.make(.testing)
        try await configure(app)
        self.app = app
        
        self.group = UserGroup(name: "Test User Group")
        try await self.group.save(on: app.db)
        
        let testParsers: [ParserFactory] = [TestBasicImporter()]
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
    
    func testImportEverythingFine() async throws {
        let groupOwnerId = try self.group.requireID()
        let db = try getDb()
        try await importerService.importFromFile(on: db, groupOwnerId: groupOwnerId, key: "test-account", fileName: "test-file.csv", filePath: "whatever")
        
        let reports = try await statusReportsService.getAll(on: db, groupIds: [groupOwnerId])
        XCTAssertEqual(reports.list.count, 1)
        XCTAssertEqual(reports.list.first?.status, "OK")
        XCTAssertEqual(reports.list.first?.description, "")
        
        let transactions = try await bankTransactionService.getAll(on: db, groupIds: [groupOwnerId])
        XCTAssertEqual(transactions.list.count, 4)
    }
    
    func testImportInvalidParserKey() async throws {
        let groupOwnerId = try self.group.requireID()
        let db = try getDb()
        
        try await importerService.importFromFile(on: db, groupOwnerId: groupOwnerId, key: "invalid-key", fileName: "some-file", filePath: "someother")
    
        
        let reports = try await statusReportsService.getAll(on: db, groupIds: [groupOwnerId])
        print(reports)
        XCTAssertEqual(reports.list.count, 1)
        XCTAssertEqual(reports.list.first?.status, "ERR")
        XCTAssertContains(reports.list.first?.description, "Parser not found for key: invalid-key")
    }
}

