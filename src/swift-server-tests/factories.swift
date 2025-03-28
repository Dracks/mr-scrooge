import Foundation
import Vapor

@testable import MrScroogeServer

protocol Factory {
	associatedtype ModelType
	func build(modifier: ((ModelType) -> ModelType)?) -> ModelType
	init()
}

class AbstractFactory<T>: Factory {
	func build(modifier: ((T) -> T)? = nil) -> T {
		let obj = self.create(id: self.nextCounter())
		return modifier?(obj) ?? obj
	}

	fileprivate func create(id: Int) -> T {
		fatalError("Not Implemented")
	}

	typealias ModelType = T

	private var counter: Int = 0

	required init() {}

	func createSequence(_ count: Int, modifier: ((T) -> T)? = nil) -> [T] {
		return (0..<count).map { _ in build(modifier: modifier) }
	}

	func nextCounter() -> Int {
		counter += 1
		return counter
	}
}

class BankTransactionFactory: AbstractFactory<BankTransaction> {

	override func create(id: Int) -> BankTransaction {
		let dateComponents = DateComponents(year: 2022, month: 2, day: 2)
		let date = Calendar.current.date(from: dateComponents)!
		return BankTransaction(
			id: UUID(),
			groupOwnerId: UUID(),
			movementName: "movement \(id)",
			date: DateOnly(date),
			value: Double(id) + Double(id) / 100.0,
			kind: "demo"
		)
	}
}

class LabelFactory: AbstractFactory<Label> {
	override func create(id: Int) -> Label {
		return Label(groupOwnerId: UUID(), name: "Label \(id)")
	}
}

class RuleFactory: AbstractFactory<Rule> {
	override func create(id: Int) -> Rule {
		return .init(groupOwnerId: UUID(), name: "Rule \(id)")
	}
}

class RuleConditionFactory: AbstractFactory<Condition> {
	override func create(id: Int) -> Condition {
		return .init(ruleId: UUID(), operation: .contains)
	}
}
