import Foundation
import Graphiti
import Vapor

class LabelTypes {
	static let labelService = LabelService()

	struct GqlLabel: Codable, CreateLabelResponse {
		let id: UUID
		let name: String
		let groupOwnerId: UUID

		init(label: Label) throws {
			self.id = try label.requireID()
			self.name = label.name
			self.groupOwnerId = label.$groupOwner.id
		}
	}
	struct GetLabels: Codable, GetLabelsResponse {
		let results: [GqlLabel]

		init(_ labels: [GqlLabel]) {
			self.results = labels
		}
	}
	protocol GetLabelsResponse {}

	struct CreateLabelArgs: Codable {
		let name: String
		let groupOwnerId: UUID?
	}

	protocol CreateLabelResponse {

	}

	class Schema: PartialSchema<MrScroogeResolver, Request> {
		@TypeDefinitions
		override var types: Types {

			Type(GqlLabel.self, as: "Label") {
				Field("id", at: \.id)
				Field("name", at: \.name)
				Field("groupOwnerId", at: \.groupOwnerId)
			}

			Type(GetLabels.self) {
				Field("results", at: \.results)
			}

			Union(GetLabelsResponse.self, members: GetLabels.self)
			Union(CreateLabelResponse.self, members: GqlLabel.self, WrongOwnerId.self)

		}

		@FieldDefinitions
		override var query: Fields {
			Field("labels", at: MrScroogeResolver.labels)
		}

		@FieldDefinitions
		override var mutation: Fields {
			Field("createLabel", at: MrScroogeResolver.createLabel) {
				Argument("name", at: \.name)
				Argument("groupOwnerId", at: \.groupOwnerId)
			}
		}
	}
}

extension MrScroogeResolver {
	func labels(req: Request, arguments: NoArguments) async throws
		-> LabelTypes.GetLabelsResponse
	{
		let user = try await getUser(fromRequest: req)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		let data = try await BankTransactionTypes.labelService.getAll(
			on: req.db, groupIds: validGroupsIds)
		let list = try data.map({ label in
			return try LabelTypes.GqlLabel(label: label)
		})
		return LabelTypes.GetLabels(list)
	}

	func createLabel(req: Request, arguments: LabelTypes.CreateLabelArgs) async throws
		-> LabelTypes.CreateLabelResponse
	{
		let user = try await getUser(fromRequest: req)
		let groupOwnerId = try arguments.groupOwnerId ?? user.defaultGroup.requireID()
		let validGroupsId = try user.groups.map { return try $0.requireID() }
		if !validGroupsId.contains(groupOwnerId) {
			return WrongOwnerId(validOwners: validGroupsId)
		}
		// Todo: should this code be moved to the service?
		let label = Label(groupOwnerId: groupOwnerId, name: arguments.name)
		try await label.save(on: req.db)
		return try LabelTypes.GqlLabel(label: label)
	}
}

extension WrongOwnerId: LabelTypes.CreateLabelResponse {}
