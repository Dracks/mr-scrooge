

// type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
// type BaseExceptionCode = `E100${Digit}${Digit}`



const ReservedMap = {
    E10000: "Test message",
    E10001: 'Invalid cursor',
    E10002: 'User not found',
    E10003: 'Parser not found',
    E10004: 'TransformHelper was created with missing fields in the mapping',
    E10005: 'Migrations folder does not exists',
    E10006: 'N26 file not found',
    E10007: 'CommerzBank file not found'
} as const

type ReservedMapType = typeof ReservedMap

export type ExceptionCode = keyof ReservedMapType
export type ExceptionMsg<T extends ExceptionCode> = ReservedMapType[T]
