import Foundation

class DateOnly: Codable, Equatable {
    static func == (lhs: DateOnly, rhs: DateOnly) -> Bool {
        return lhs.year == rhs.year && lhs.month == rhs.month && lhs.day == rhs.day
    }
    
    let year: Int
    let month: Int
    let day: Int
    
    init(_ date: Date) {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year, .month, .day], from: date)
        self.year = components.year!
        self.month = components.month!
        self.day = components.day!
    }
    
    convenience init?(year: Int, month: Int, day: Int) {
        guard let date = DateComponents(calendar: .current, year: year, month: month, day: day).date else {
            return nil
        }
        self.init(date)
    }
    
    convenience init?(_ string: String) {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: string) else {
            return nil
        }
        self.init(date)
    }
    
    func getDate() -> Date {
        var components = DateComponents()
        components.year = year
        components.month = month
        components.day = day
        return Calendar.current.date(from: components)!
    }
    
    func toString() -> String {
        return String(format: "%04d-%02d-%02d", year, month, day)
    }
}

extension DateOnly: CustomStringConvertible {
    var description: String {
        return toString()
    }
}
