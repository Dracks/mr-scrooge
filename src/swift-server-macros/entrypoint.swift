@attached(accessor)
public macro ServiceDependency() =
	#externalMacro(module: "swift_macrosMacros", type: "ServiceDependencyMacro")

public protocol StringEnumType: Hashable & RawRepresentable where Self.RawValue == String {}

@freestanding(expression)
public macro BasicBadRequest<T>(msg: String, code: any StringEnumType) -> T =
	#externalMacro(module: "swift_macrosMacros", type: "BasicBadRequest")
	
@freestanding(expression)
public macro BasicNotFound<T>(msg: String, code: any StringEnumType) -> T =
		#externalMacro(module: "swift_macrosMacros", type: "BasicNotFound")
