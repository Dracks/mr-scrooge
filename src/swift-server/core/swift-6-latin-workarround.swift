// Temporary workaround for Windows CP-1252 encoding support in Swift
// This implementation provides a manual decoder for Windows CP-1252 encoded files
// as Swift's built-in support is currently incomplete.
//
// Credits: @TimBudarick
// 
// TODO: Remove this workaround when Swift adds proper Windows CP-1252 support
// Tracking issue: https://github.com/swiftlang/swift/issues/78382

import Foundation

extension String.Encoding {
	static let windowsCP1252Map: [UInt8: String] = [
		0x0: "",  // NULL,
		0x1: "\u{0001}",  // START OF HEADING,
		0x2: "\u{0002}",  // START OF TEXT,
		0x3: "\u{0003}",  // END OF TEXT,
		0x4: "\u{0004}",  // END OF TRANSMISSION,
		0x5: "\u{0005}",  // ENQUIRY,
		0x6: "\u{0006}",  // ACKNOWLEDGE,
		0x7: "\u{0007}",  // BELL,
		0x8: "\u{0008}",  // BACKSPACE,
		0x9: "\u{0009}",  // HORIZONTAL TABULATION,
		0xa: "\u{000A}",  // LINE FEED,
		0xb: "\u{000B}",  // VERTICAL TABULATION,
		0xc: "\u{000C}",  // FORM FEED,
		0xd: "\u{000D}",  // CARRIAGE RETURN,
		0xe: "\u{000E}",  // SHIFT OUT,
		0xf: "\u{000F}",  // SHIFT IN,
		0x10: "\u{0010}",  // DATA LINK ESCAPE,
		0x11: "\u{0011}",  // DEVICE CONTROL ONE,
		0x12: "\u{0012}",  // DEVICE CONTROL TWO,
		0x13: "\u{0013}",  // DEVICE CONTROL THREE,
		0x14: "\u{0014}",  // DEVICE CONTROL FOUR,
		0x15: "\u{0015}",  // NEGATIVE ACKNOWLEDGE,
		0x16: "\u{0016}",  // SYNCHRONOUS IDLE,
		0x17: "\u{0017}",  // END OF TRANSMISSION BLOCK,
		0x18: "\u{0018}",  // CANCEL,
		0x19: "\u{0019}",  // END OF MEDIUM,
		0x1a: "\u{001A}",  // SUBSTITUTE,
		0x1b: "\u{001B}",  // ESCAPE,
		0x1c: "\u{001C}",  // FILE SEPARATOR,
		0x1d: "\u{001D}",  // GROUP SEPARATOR,
		0x1e: "\u{001E}",  // RECORD SEPARATOR,
		0x1f: "\u{001F}",  // UNIT SEPARATOR,
		0x20: "\u{0020}",  // SPACE,
		0x21: "\u{0021}",  // EXCLAMATION MARK,
		0x22: "\u{0022}",  // QUOTATION MARK,
		0x23: "\u{0023}",  // NUMBER SIGN,
		0x24: "\u{0024}",  // DOLLAR SIGN,
		0x25: "\u{0025}",  // PERCENT SIGN,
		0x26: "\u{0026}",  // AMPERSAND,
		0x27: "\u{0027}",  // APOSTROPHE,
		0x28: "\u{0028}",  // LEFT PARENTHESIS,
		0x29: "\u{0029}",  // RIGHT PARENTHESIS,
		0x2a: "\u{002A}",  // ASTERISK,
		0x2b: "\u{002B}",  // PLUS SIGN,
		0x2c: "\u{002C}",  // COMMA,
		0x2d: "\u{002D}",  // HYPHEN-MINUS,
		0x2e: "\u{002E}",  // FULL STOP,
		0x2f: "\u{002F}",  // SOLIDUS,
		0x30: "\u{0030}",  // DIGIT ZERO,
		0x31: "\u{0031}",  // DIGIT ONE,
		0x32: "\u{0032}",  // DIGIT TWO,
		0x33: "\u{0033}",  // DIGIT THREE,
		0x34: "\u{0034}",  // DIGIT FOUR,
		0x35: "\u{0035}",  // DIGIT FIVE,
		0x36: "\u{0036}",  // DIGIT SIX,
		0x37: "\u{0037}",  // DIGIT SEVEN,
		0x38: "\u{0038}",  // DIGIT EIGHT,
		0x39: "\u{0039}",  // DIGIT NINE,
		0x3a: "\u{003A}",  // COLON,
		0x3b: "\u{003B}",  // SEMICOLON,
		0x3c: "\u{003C}",  // LESS-THAN SIGN,
		0x3d: "\u{003D}",  // EQUALS SIGN,
		0x3e: "\u{003E}",  // GREATER-THAN SIGN,
		0x3f: "\u{003F}",  // QUESTION MARK,
		0x40: "\u{0040}",  // COMMERCIAL AT,
		0x41: "\u{0041}",  // LATIN CAPITAL LETTER A,
		0x42: "\u{0042}",  // LATIN CAPITAL LETTER B,
		0x43: "\u{0043}",  // LATIN CAPITAL LETTER C,
		0x44: "\u{0044}",  // LATIN CAPITAL LETTER D,
		0x45: "\u{0045}",  // LATIN CAPITAL LETTER E,
		0x46: "\u{0046}",  // LATIN CAPITAL LETTER F,
		0x47: "\u{0047}",  // LATIN CAPITAL LETTER G,
		0x48: "\u{0048}",  // LATIN CAPITAL LETTER H,
		0x49: "\u{0049}",  // LATIN CAPITAL LETTER I,
		0x4a: "\u{004A}",  // LATIN CAPITAL LETTER J,
		0x4b: "\u{004B}",  // LATIN CAPITAL LETTER K,
		0x4c: "\u{004C}",  // LATIN CAPITAL LETTER L,
		0x4d: "\u{004D}",  // LATIN CAPITAL LETTER M,
		0x4e: "\u{004E}",  // LATIN CAPITAL LETTER N,
		0x4f: "\u{004F}",  // LATIN CAPITAL LETTER O,
		0x50: "\u{0050}",  // LATIN CAPITAL LETTER P,
		0x51: "\u{0051}",  // LATIN CAPITAL LETTER Q,
		0x52: "\u{0052}",  // LATIN CAPITAL LETTER R,
		0x53: "\u{0053}",  // LATIN CAPITAL LETTER S,
		0x54: "\u{0054}",  // LATIN CAPITAL LETTER T,
		0x55: "\u{0055}",  // LATIN CAPITAL LETTER U,
		0x56: "\u{0056}",  // LATIN CAPITAL LETTER V,
		0x57: "\u{0057}",  // LATIN CAPITAL LETTER W,
		0x58: "\u{0058}",  // LATIN CAPITAL LETTER X,
		0x59: "\u{0059}",  // LATIN CAPITAL LETTER Y,
		0x5a: "\u{005A}",  // LATIN CAPITAL LETTER Z,
		0x5b: "\u{005B}",  // LEFT SQUARE BRACKET,
		0x5c: "\u{005C}",  // REVERSE SOLIDUS,
		0x5d: "\u{005D}",  // RIGHT SQUARE BRACKET,
		0x5e: "\u{005E}",  // CIRCUMFLEX ACCENT,
		0x5f: "\u{005F}",  // LOW LINE,
		0x60: "\u{0060}",  // GRAVE ACCENT,
		0x61: "\u{0061}",  // LATIN SMALL LETTER A,
		0x62: "\u{0062}",  // LATIN SMALL LETTER B,
		0x63: "\u{0063}",  // LATIN SMALL LETTER C,
		0x64: "\u{0064}",  // LATIN SMALL LETTER D,
		0x65: "\u{0065}",  // LATIN SMALL LETTER E,
		0x66: "\u{0066}",  // LATIN SMALL LETTER F,
		0x67: "\u{0067}",  // LATIN SMALL LETTER G,
		0x68: "\u{0068}",  // LATIN SMALL LETTER H,
		0x69: "\u{0069}",  // LATIN SMALL LETTER I,
		0x6a: "\u{006A}",  // LATIN SMALL LETTER J,
		0x6b: "\u{006B}",  // LATIN SMALL LETTER K,
		0x6c: "\u{006C}",  // LATIN SMALL LETTER L,
		0x6d: "\u{006D}",  // LATIN SMALL LETTER M,
		0x6e: "\u{006E}",  // LATIN SMALL LETTER N,
		0x6f: "\u{006F}",  // LATIN SMALL LETTER O,
		0x70: "\u{0070}",  // LATIN SMALL LETTER P,
		0x71: "\u{0071}",  // LATIN SMALL LETTER Q,
		0x72: "\u{0072}",  // LATIN SMALL LETTER R,
		0x73: "\u{0073}",  // LATIN SMALL LETTER S,
		0x74: "\u{0074}",  // LATIN SMALL LETTER T,
		0x75: "\u{0075}",  // LATIN SMALL LETTER U,
		0x76: "\u{0076}",  // LATIN SMALL LETTER V,
		0x77: "\u{0077}",  // LATIN SMALL LETTER W,
		0x78: "\u{0078}",  // LATIN SMALL LETTER X,
		0x79: "\u{0079}",  // LATIN SMALL LETTER Y,
		0x7a: "\u{007A}",  // LATIN SMALL LETTER Z,
		0x7b: "\u{007B}",  // LEFT CURLY BRACKET,
		0x7c: "\u{007C}",  // VERTICAL LINE,
		0x7d: "\u{007D}",  // RIGHT CURLY BRACKET,
		0x7e: "\u{007E}",  // TILDE,
		0x7f: "\u{007F}",  // DELETE,
		0x80: "\u{20AC}",  // EURO SIGN,
		0x81: "\u{FFFD}",  // UNDEFINED,
		0x82: "\u{201A}",  // SINGLE LOW-9 QUOTATION MARK,
		0x83: "\u{0192}",  // LATIN SMALL LETTER F WITH HOOK,
		0x84: "\u{201E}",  // DOUBLE LOW-9 QUOTATION MARK,
		0x85: "\u{2026}",  // HORIZONTAL ELLIPSIS,
		0x86: "\u{2020}",  // DAGGER,
		0x87: "\u{2021}",  // DOUBLE DAGGER,
		0x88: "\u{02C6}",  // MODIFIER LETTER CIRCUMFLEX ACCENT,
		0x89: "\u{2030}",  // PER MILLE SIGN,
		0x8a: "\u{0160}",  // LATIN CAPITAL LETTER S WITH CARON,
		0x8b: "\u{2039}",  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK,
		0x8c: "\u{0152}",  // LATIN CAPITAL LIGATURE OE,
		0x8d: "\u{FFFD}",  // UNDEFINED,
		0x8e: "\u{017D}",  // LATIN CAPITAL LETTER Z WITH CARON,
		0x8f: "\u{FFFD}",  // UNDEFINED,
		0x90: "\u{FFFD}",  // UNDEFINED,
		0x91: "\u{2018}",  // LEFT SINGLE QUOTATION MARK,
		0x92: "\u{2019}",  // RIGHT SINGLE QUOTATION MARK,
		0x93: "\u{201C}",  // LEFT DOUBLE QUOTATION MARK,
		0x94: "\u{201D}",  // RIGHT DOUBLE QUOTATION MARK,
		0x95: "\u{2022}",  // BULLET,
		0x96: "\u{2013}",  // EN DASH,
		0x97: "\u{2014}",  // EM DASH,
		0x98: "\u{02DC}",  // SMALL TILDE,
		0x99: "\u{2122}",  // TRADE MARK SIGN,
		0x9a: "\u{0161}",  // LATIN SMALL LETTER S WITH CARON,
		0x9b: "\u{203A}",  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK,
		0x9c: "\u{0153}",  // LATIN SMALL LIGATURE OE,
		0x9d: "\u{FFFD}",  // UNDEFINED,
		0x9e: "\u{017E}",  // LATIN SMALL LETTER Z WITH CARON,
		0x9f: "\u{0178}",  // LATIN CAPITAL LETTER Y WITH DIAERESIS,
		0xa0: "\u{00A0}",  // NO-BREAK SPACE,
		0xa1: "\u{00A1}",  // INVERTED EXCLAMATION MARK,
		0xa2: "\u{00A2}",  // CENT SIGN,
		0xa3: "\u{00A3}",  // POUND SIGN,
		0xa4: "\u{00A4}",  // CURRENCY SIGN,
		0xa5: "\u{00A5}",  // YEN SIGN,
		0xa6: "\u{00A6}",  // BROKEN BAR,
		0xa7: "\u{00A7}",  // SECTION SIGN,
		0xa8: "\u{00A8}",  // DIAERESIS,
		0xa9: "\u{00A9}",  // COPYRIGHT SIGN,
		0xaa: "\u{00AA}",  // FEMININE ORDINAL INDICATOR,
		0xab: "\u{00AB}",  // LEFT-POINTING DOUBLE ANGLE QUOTATION MARK,
		0xac: "\u{00AC}",  // NOT SIGN,
		0xad: "\u{00AD}",  // SOFT HYPHEN,
		0xae: "\u{00AE}",  // REGISTERED SIGN,
		0xaf: "\u{00AF}",  // MACRON,
		0xb0: "\u{00B0}",  // DEGREE SIGN,
		0xb1: "\u{00B1}",  // PLUS-MINUS SIGN,
		0xb2: "\u{00B2}",  // SUPERSCRIPT TWO,
		0xb3: "\u{00B3}",  // SUPERSCRIPT THREE,
		0xb4: "\u{00B4}",  // ACUTE ACCENT,
		0xb5: "\u{00B5}",  // MICRO SIGN,
		0xb6: "\u{00B6}",  // PILCROW SIGN,
		0xb7: "\u{00B7}",  // MIDDLE DOT,
		0xb8: "\u{00B8}",  // CEDILLA,
		0xb9: "\u{00B9}",  // SUPERSCRIPT ONE,
		0xba: "\u{00BA}",  // MASCULINE ORDINAL INDICATOR,
		0xbb: "\u{00BB}",  // RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK,
		0xbc: "\u{00BC}",  // VULGAR FRACTION ONE QUARTER,
		0xbd: "\u{00BD}",  // VULGAR FRACTION ONE HALF,
		0xbe: "\u{00BE}",  // VULGAR FRACTION THREE QUARTERS,
		0xbf: "\u{00BF}",  // INVERTED QUESTION MARK,
		0xc0: "\u{00C0}",  // LATIN CAPITAL LETTER A WITH GRAVE,
		0xc1: "\u{00C1}",  // LATIN CAPITAL LETTER A WITH ACUTE,
		0xc2: "\u{00C2}",  // LATIN CAPITAL LETTER A WITH CIRCUMFLEX,
		0xc3: "\u{00C3}",  // LATIN CAPITAL LETTER A WITH TILDE,
		0xc4: "\u{00C4}",  // LATIN CAPITAL LETTER A WITH DIAERESIS,
		0xc5: "\u{00C5}",  // LATIN CAPITAL LETTER A WITH RING ABOVE,
		0xc6: "\u{00C6}",  // LATIN CAPITAL LETTER AE,
		0xc7: "\u{00C7}",  // LATIN CAPITAL LETTER C WITH CEDILLA,
		0xc8: "\u{00C8}",  // LATIN CAPITAL LETTER E WITH GRAVE,
		0xc9: "\u{00C9}",  // LATIN CAPITAL LETTER E WITH ACUTE,
		0xca: "\u{00CA}",  // LATIN CAPITAL LETTER E WITH CIRCUMFLEX,
		0xcb: "\u{00CB}",  // LATIN CAPITAL LETTER E WITH DIAERESIS,
		0xcc: "\u{00CC}",  // LATIN CAPITAL LETTER I WITH GRAVE,
		0xcd: "\u{00CD}",  // LATIN CAPITAL LETTER I WITH ACUTE,
		0xce: "\u{00CE}",  // LATIN CAPITAL LETTER I WITH CIRCUMFLEX,
		0xcf: "\u{00CF}",  // LATIN CAPITAL LETTER I WITH DIAERESIS,
		0xd0: "\u{00D0}",  // LATIN CAPITAL LETTER ETH,
		0xd1: "\u{00D1}",  // LATIN CAPITAL LETTER N WITH TILDE,
		0xd2: "\u{00D2}",  // LATIN CAPITAL LETTER O WITH GRAVE,
		0xd3: "\u{00D3}",  // LATIN CAPITAL LETTER O WITH ACUTE,
		0xd4: "\u{00D4}",  // LATIN CAPITAL LETTER O WITH CIRCUMFLEX,
		0xd5: "\u{00D5}",  // LATIN CAPITAL LETTER O WITH TILDE,
		0xd6: "\u{00D6}",  // LATIN CAPITAL LETTER O WITH DIAERESIS,
		0xd7: "\u{00D7}",  // MULTIPLICATION SIGN,
		0xd8: "\u{00D8}",  // LATIN CAPITAL LETTER O WITH STROKE,
		0xd9: "\u{00D9}",  // LATIN CAPITAL LETTER U WITH GRAVE,
		0xda: "\u{00DA}",  // LATIN CAPITAL LETTER U WITH ACUTE,
		0xdb: "\u{00DB}",  // LATIN CAPITAL LETTER U WITH CIRCUMFLEX,
		0xdc: "\u{00DC}",  // LATIN CAPITAL LETTER U WITH DIAERESIS,
		0xdd: "\u{00DD}",  // LATIN CAPITAL LETTER Y WITH ACUTE,
		0xde: "\u{00DE}",  // LATIN CAPITAL LETTER THORN,
		0xdf: "\u{00DF}",  // LATIN SMALL LETTER SHARP S,
		0xe0: "\u{00E0}",  // LATIN SMALL LETTER A WITH GRAVE,
		0xe1: "\u{00E1}",  // LATIN SMALL LETTER A WITH ACUTE,
		0xe2: "\u{00E2}",  // LATIN SMALL LETTER A WITH CIRCUMFLEX,
		0xe3: "\u{00E3}",  // LATIN SMALL LETTER A WITH TILDE,
		0xe4: "\u{00E4}",  // LATIN SMALL LETTER A WITH DIAERESIS,
		0xe5: "\u{00E5}",  // LATIN SMALL LETTER A WITH RING ABOVE,
		0xe6: "\u{00E6}",  // LATIN SMALL LETTER AE,
		0xe7: "\u{00E7}",  // LATIN SMALL LETTER C WITH CEDILLA,
		0xe8: "\u{00E8}",  // LATIN SMALL LETTER E WITH GRAVE,
		0xe9: "\u{00E9}",  // LATIN SMALL LETTER E WITH ACUTE,
		0xea: "\u{00EA}",  // LATIN SMALL LETTER E WITH CIRCUMFLEX,
		0xeb: "\u{00EB}",  // LATIN SMALL LETTER E WITH DIAERESIS,
		0xec: "\u{00EC}",  // LATIN SMALL LETTER I WITH GRAVE,
		0xed: "\u{00ED}",  // LATIN SMALL LETTER I WITH ACUTE,
		0xee: "\u{00EE}",  // LATIN SMALL LETTER I WITH CIRCUMFLEX,
		0xef: "\u{00EF}",  // LATIN SMALL LETTER I WITH DIAERESIS,
		0xf0: "\u{00F0}",  // LATIN SMALL LETTER ETH,
		0xf1: "\u{00F1}",  // LATIN SMALL LETTER N WITH TILDE,
		0xf2: "\u{00F2}",  // LATIN SMALL LETTER O WITH GRAVE,
		0xf3: "\u{00F3}",  // LATIN SMALL LETTER O WITH ACUTE,
		0xf4: "\u{00F4}",  // LATIN SMALL LETTER O WITH CIRCUMFLEX,
		0xf5: "\u{00F5}",  // LATIN SMALL LETTER O WITH TILDE,
		0xf6: "\u{00F6}",  // LATIN SMALL LETTER O WITH DIAERESIS,
		0xf7: "\u{00F7}",  // DIVISION SIGN,
		0xf8: "\u{00F8}",  // LATIN SMALL LETTER O WITH STROKE,
		0xf9: "\u{00F9}",  // LATIN SMALL LETTER U WITH GRAVE,
		0xfa: "\u{00FA}",  // LATIN SMALL LETTER U WITH ACUTE,
		0xfb: "\u{00FB}",  // LATIN SMALL LETTER U WITH CIRCUMFLEX,
		0xfc: "\u{00FC}",  // LATIN SMALL LETTER U WITH DIAERESIS,
		0xfd: "\u{00FD}",  // LATIN SMALL LETTER Y WITH ACUTE,
		0xfe: "\u{00FE}",  // LATIN SMALL LETTER THORN,
		0xff: "\u{00FF}",  // LATIN SMALL LETTER Y WITH DIAERESIS
	]

}

extension String {

	/// Converts a `Data` object containing Windows CP-1252 encoded bytes into a `String`.
	///
	/// - Parameters:
	///   - data: The `Data` object containing the Windows CP-1252 encoded bytes.
	/// - Returns: A `String` object initialized with the decoded characters from the provided data, or `nil` if an invalid byte is encountered.
	static func fromWindowsCP1252(_ data: Data) -> String? {
		#if os(macOS)
			return String(data: data, encoding: .windowsCP1252)
		#else
			var decodedString = String()
			decodedString.reserveCapacity(data.count)

			for byte in data {
				if let character = String.Encoding.windowsCP1252Map[byte] {
					decodedString.append(character)
				} else {
					return nil
				}
			}

			return decodedString
		#endif
	}
}
