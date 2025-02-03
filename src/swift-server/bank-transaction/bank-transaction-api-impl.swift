import Foundation
import OpenAPIRuntime
import Vapor

extension MrScroogeAPIImpl {

	func ApiBankTransactions_linkLabel(_ input: Operations.ApiBankTransactions_linkLabel.Input)
		async throws -> Operations.ApiBankTransactions_linkLabel.Output
	{
		let bankTransactionService = request.application.bankTransactionService
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		guard let transactionId = UUID(uuidString: input.path.transactionId),
			let labelId = UUID(uuidString: input.path.labelId)
		else {
			return .undocumented(statusCode: 400, UndocumentedPayload())
		}
		let linkState = try await bankTransactionService.link(
			transaction: transactionId, toLabel: labelId,
			withValidGroups: validGroupsIds)
		switch linkState {
		case .ok:
			let (transaction, labelIds) = try await bankTransactionService.getAll(
				groupIds: validGroupsIds,
				transactionIds: [transactionId])
			return .ok(
				.init(
					body: .json(
						.init(
							bankTransactionId: transactionId,
							bankTransaction: transaction.list.first!,
							labelIds: labelIds[transactionId]!))))
		case .labelNotFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							value1: .init(
								message: "Label not found",
								code: ApiError.API10000.rawValue,
								labelSuplied: labelId.uuidString))))
			)
		case .transactionNotFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							value2: .init(
								message: "Transaction not found",
								code: ApiError.API10001.rawValue,
								bankTransactionSuplied:
									transactionId.uuidString))))
			)
		case .groupIdsMismatch:
			return .conflict(
				.init(
					body: .json(
						.init(
							message:
								"The transaction and the label should be in the same group owner Id",
							code: ApiError.API10002.rawValue))))
		}
	}

	func ApiBankTransactions_unlinkLabel(
		_ input: Operations.ApiBankTransactions_unlinkLabel.Input
	) async throws -> Operations.ApiBankTransactions_unlinkLabel.Output {
		let bankTransactionService = request.application.bankTransactionService
		let user = try await getUser(fromRequest: request)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		guard let transactionId = UUID(uuidString: input.path.transactionId),
			let labelId = UUID(uuidString: input.path.labelId)
		else {
			return .undocumented(statusCode: 400, UndocumentedPayload())
		}
		let unlinkState = try await bankTransactionService.unlink(
			transaction: transactionId, fromLabel: labelId,
			withValidGroups: validGroupsIds)
		switch unlinkState {
		case .ok:
			let (transaction, labelIds) = try await bankTransactionService.getAll(
				groupIds: validGroupsIds,
				transactionIds: [transactionId])
			return .ok(
				.init(
					body: .json(
						.init(
							bankTransactionId: transactionId,
							bankTransaction: transaction.list.first!,
							labelIds: labelIds[transactionId]!))))
		case .transactionNotFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							value2: .init(
								message: "Transaction not found",
								code: ApiError.API10001.rawValue,
								bankTransactionSuplied:
									transactionId.uuidString))))
			)
		case .linkNotFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							value1: .init(
								message:
									"There is not link between transaction and label",
								code: ApiError.API10003.rawValue
							)
						)
					)
				)
			)
		}
	}

	func ApiBankTransactions_list(_ input: Operations.ApiBankTransactions_list.Input)
		async throws -> Operations.ApiBankTransactions_list.Output
	{
		let bankTransactionService = request.application.bankTransactionService
		let req = request
		let user = try await getUser(fromRequest: req)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		var inputGroups: [UUID]?
		if let inputGroupsStr = input.query.groupIds {
			inputGroups = inputGroupsStr.map { UUID(uuidString: $0)! }
		}
		let groupIds = inputGroups ?? validGroupsIds
		if !groupIds.filter({ return !validGroupsIds.contains($0) }).isEmpty {
			//return WrongOwnerId(validOwners: validGroupsIds)
			return .undocumented(statusCode: 400, UndocumentedPayload())
		}

		let (data, labelIds) = try await bankTransactionService.getAll(
			groupIds: groupIds,
			pageQuery: .init(
				limit: input.query.limit ?? 100, cursor: input.query.cursor))
		let results = try data.list.map { movement in
			let movementId = try movement.requireID()
			let labels: [UUID] = labelIds[movementId]!
			return Components.Schemas.BankTransaction(
				bankTransactionId: movementId, bankTransaction: movement,
				labelIds: labels)
		}
		return .ok(.init(body: .json(.init(results: results, next: data.next))))
	}

	func ApiBankTransactions_comment(_ input: Operations.ApiBankTransactions_comment.Input)
		async throws -> Operations.ApiBankTransactions_comment.Output
	{
		let bankTransactionService = request.application.bankTransactionService
		let req = request
		let user = try await getUser(fromRequest: req)
		let validGroupsIds = try user.groups.map { return try $0.requireID() }
		guard let transactionId = UUID(uuidString: input.path.transactionId) else {
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Not valid id",
							code: ApiError.API10011.rawValue,
							bankTransactionSuplied: input.path
								.transactionId))))
		}
		var comment: String?
		switch input.body {
		case let .json(body):
			comment = body.comment
		}

		let result = try await bankTransactionService.setComment(
			for: transactionId, andComment: comment,
			withValidGroups: validGroupsIds)
		switch result {
		case .notFound:
			return .notFound(
				.init(
					body: .json(
						.init(
							message: "Transaction not found",
							code: ApiError.API10012.rawValue,
							bankTransactionSuplied: input.path
								.transactionId))))
		case .ok:
			let (transaction, labelIds) = try await bankTransactionService.getAll(
				groupIds: validGroupsIds,
				transactionIds: [transactionId])
			return .ok(
				.init(
					body: .json(
						.init(
							bankTransactionId: transactionId,
							bankTransaction: transaction.list.first!,
							labelIds: labelIds[transactionId]!))))
		}
	}
}

extension Components.Schemas.BankTransaction {
	init(bankTransactionId: UUID, bankTransaction: BankTransaction, labelIds: [UUID]) {
		id = bankTransactionId.uuidString
		groupOwnerId = bankTransaction.groupOwnerId.uuidString
		movementName = bankTransaction.movementName
		date = bankTransaction.date.toString()
		dateValue = bankTransaction.dateValue?.toString()
		details = bankTransaction.details
		value = bankTransaction.value
		kind = bankTransaction.kind
		comment = bankTransaction.comment
		self.labelIds = labelIds.map { $0.uuidString }
	}
}
