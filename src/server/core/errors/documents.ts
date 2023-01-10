interface ErrorDoc {
    message: string;
}

export const ErrorDocs : Record<`ER${number}`, ErrorDoc> = {
    'ER0000': {
        message: 'Not found user in database'
    }
} as const

export type errorCode = keyof typeof ErrorDocs