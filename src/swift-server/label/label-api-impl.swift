import OpenAPIRuntime
import Foundation

let labelService = LabelService()
extension MrScroogeAPIImpl {
    func ApiLabels_create(_ input: Operations.ApiLabels_create.Input) async throws
		-> Operations.ApiLabels_create.Output
	{
        let user = try await getUser(fromRequest: request)
        let validGroupsId = try user.groups.map{ return try $0.requireID() }
        var inputLabel: Components.Schemas.CreateLabel
        switch input.body{
        case .json(let _label):
            inputLabel = _label
        }
        guard let groupOwnerId = UUID(uuidString: inputLabel.groupOwnerId), validGroupsId.contains(groupOwnerId) else {
            print(validGroupsId)
            return .unauthorized(.init(body: .json(.init(message: "Invalid Group Owner ID", code: ApiError.API10004.rawValue, validGroupOwners: validGroupsId.map{$0.uuidString}))))
        }

        let label = try await labelService.createLabel(on: request.db, label: .init(groupOwnerId: groupOwnerId , name: inputLabel.name))


        return .ok(.init(body: .json(.init(label: label))))
	}

	func ApiLabels_list(_ input: Operations.ApiLabels_list.Input) async throws
		-> Operations.ApiLabels_list.Output
	{
        let user = try await getUser(fromRequest: request)
        let validGroupsIds = try user.groups.map { return try $0.requireID() }
        let data = try await labelService.getAll(
            on: request.db, pageQuery: .init(limit: input.query.limit ?? 100, cursor: input.query.cursor), groupIds: validGroupsIds)

        return .ok(.init(body: .json(.init(results: data.list.map { .init(label: $0)}, next: data.next))))
	}
}

extension Components.Schemas.Label {
	init(label: Label) {
		id = label.id!.uuidString
		name = label.name
		groupOwnerId = label.$groupOwner.id.uuidString
	}
}
