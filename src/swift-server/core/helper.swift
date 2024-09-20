extension Array {
	subscript(safe index: Index) -> Element? {
		return indices.contains(index) ? self[index] : nil
	}
}


// Define a protocol for collections that use a specific type as an index
protocol IndexedCollection {
    associatedtype IndexType: Hashable
    associatedtype ValueType

    func get(_ index: IndexType) -> ValueType?
}

// Extend Array to conform to IndexedCollection with IndexType as Int
extension Array: IndexedCollection {
    typealias IndexType = Int
    typealias ValueType = Element

    func get(_ index: Int) -> Element? {
        if self.count > index {
            return self[index]
        }
        return nil
    }
}

// Extend Dictionary to conform to IndexedCollection with IndexType as the Dictionary's Key
extension Dictionary: IndexedCollection {
    typealias IndexType = Key
    typealias Element = Value

    func get(_ index: Key) -> Value? {
        return self[index]
    }
}
