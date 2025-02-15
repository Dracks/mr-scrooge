import Foundation

struct FieldsMap<T: Hashable>: @unchecked Sendable {
	var movementName: T
	var date: T
	var dateValue: T?
	var details: T?
	var value: T
	var description: T?
}

func parseToDouble(_ value: Any?) -> Double? {
	if let stringValue = value as? String {
		return Double(stringValue)
	} else if let numberValue = value as? NSNumber {
		return numberValue.doubleValue
	} else if let doubleValue = value as? Double {
		return doubleValue
	} else if let intValue = value as? Int {
		return Double(intValue)
	}
	return nil
}

final class TransformHelper<D: IndexedCollection>: @unchecked Sendable {

	let mapping: FieldsMap<D.IndexType>
	let dateFormatter: DateFormatter

	init(_ mapping: FieldsMap<D.IndexType>, dateFormat: String) {
		self.mapping = mapping
		dateFormatter = DateFormatter()
		dateFormatter.dateFormat = dateFormat
	}

	func map(_ row: D) throws -> PartialBankTransaction {

		var errorFields: [String] = []
		var movementName: String?
		var date: Date?
		var value: Double?
		var dateValue: Date?
		var details: String?

		if let name = row.get(mapping.movementName) as? String {
			movementName = name
		} else {
			errorFields.append("movementName")
		}

		if let dateString = row.get(mapping.date) as? String,
			let parsedDate = dateFormatter.date(from: dateString)
		{
			date = parsedDate
		} else {
			errorFields.append("date")
		}

		if let parsedValue = parseToDouble(row.get(mapping.value)) {
			value = parsedValue
		} else {
			errorFields.append("value")
		}

		if let dateValueKey = mapping.dateValue {
			if let dateValueString = row.get(dateValueKey) as? String,
				let parsedDateValue = dateFormatter.date(from: dateValueString)
			{
				dateValue = parsedDateValue
			}
		}

		if let detailsKey = mapping.details {
			if let parsedDetails = row.get(detailsKey) as? String {
				details = parsedDetails
			}
		}

		if !errorFields.isEmpty {
			throw Exception(.E10004, context: ["invalidFields": errorFields])
		}
		return PartialBankTransaction(
			movementName: movementName!,
			date: DateOnly(date!),
			dateValue: dateValue.map { DateOnly($0) },
			details: details,
			value: value!
		)
	}
}
