// GetPageResponse
struct GetPageResponse<T: Codable>: Codable {
	let results: [T]
	let next: String?
}
