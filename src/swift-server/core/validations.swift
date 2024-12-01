import Fluent
import Foundation

protocol InputWithUserGroup {
	var groupOwnerId: String { get }
}

class TransformerAndValidator {}

extension TransformerAndValidator {
	enum GroupOwnerIdState {
		case notUuid
		case notOwned(validGroups: [UUID])
		case ok(id: UUID)
	}
	static func groupOwner(_ obj: InputWithUserGroup, on db: Database, for user: User) throws
		-> GroupOwnerIdState
	{
		guard let groupOwnerId = UUID(uuidString: obj.groupOwnerId) else {
			return .notUuid
		}

		let validGroupsId = try user.groups.map { return try $0.requireID() }
		if validGroupsId.contains(groupOwnerId) {
			return .ok(id: groupOwnerId)
		}
		return .notOwned(validGroups: validGroupsId)
	}
}

protocol InputWithParentRule {
	var parentRuleId: String? { get }
}

extension TransformerAndValidator {
	enum ParentRuleState {
		case notUuid
		case notFound
		case ok(parent: Rule?)
	}
	static func parentRule(_ obj: InputWithParentRule, on db: Database, for userGroup: UUID)
		async throws -> ParentRuleState
	{
		guard let parentIdStr = obj.parentRuleId else {
			return .ok(parent: nil)
		}
		guard let parentId = UUID(uuidString: parentIdStr) else {
			return .notUuid
		}
		let realParent = try await Rule.query(on: db).filter(\.$id == parentId).filter(
			\.$groupOwner.$id == userGroup
		).first()
		guard let realParent else {
			return .notFound
		}

		return .ok(parent: realParent)
	}

	enum ParentRuleOnEditState {
		case parentRule(state: ParentRuleState)
		case itsOwnParent
	}

	static func parentRule(
		_ obj: InputWithParentRule, ruleId: UUID, on db: Database, for userGroup: UUID
	)
		async throws -> ParentRuleOnEditState
	{
		let state = try await parentRule(obj, on: db, for: userGroup)
		let realParent: Rule
		switch state {
		case .notFound:
			return .parentRule(state: .notFound)
		case .notUuid:
			return .parentRule(state: .notUuid)
		case .ok(let rule):
			if let rule {
				realParent = rule
			} else {
				return .parentRule(state: .ok(parent: nil))
			}
		}
		var parentRule: Rule = realParent
		var visitedRuleIds = Set<UUID>()
		while true {
		  let parentRuleId = try parentRule.requireID()
				if visitedRuleIds.contains(parentRuleId){
				    return .itsOwnParent
				}
				visitedRuleIds.insert(parentRuleId)
			if parentRuleId == ruleId {
				return .itsOwnParent
			}
			guard let parentID = parentRule.$parent.id else {
				return .parentRule(state: .ok(parent: realParent))
			}
			let retrieveParentRule = try await Rule.query(on: db).filter(
				\.$id == parentID
			).filter(
				\.$groupOwner.$id == userGroup
			).first()
			guard let retrieveParentRule else {
				print(
					"Rule \(try parentRule.requireID()) is corrupted as is pointing to a parent that is not found for the user group \(userGroup)."
				)
				return .parentRule(state: .ok(parent: realParent))
			}
			parentRule = retrieveParentRule
		}
	}
}
