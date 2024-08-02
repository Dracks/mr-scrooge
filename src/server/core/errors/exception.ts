import deepmergeCreator from '@fastify/deepmerge'

import { ExceptionCode, ExceptionMsg } from './reserved-codes'

// https://medium.com/with-orus/the-5-commandments-of-clean-error-handling-in-typescript-93a9cbdf1af5

type Jsonable = string | number | boolean |symbol | null | undefined | readonly Jsonable[] | { readonly [key: string]: Jsonable } | { toJSON(): Jsonable }

type Context = Record<string, Jsonable>


interface StdDictError {
    cause?: StdDictError,
    context?: Context
    message: string
    stack?: string,
}

const deepmerge = deepmergeCreator()

export class Exception<EC extends ExceptionCode=ExceptionCode> extends Error{

    private readonly _stackCodes : Array<ExceptionCode>

    readonly context : Context

    get stackCodes(): Array<ExceptionCode> {
        // eslint-disable-next-line no-underscore-dangle
        return this._stackCodes
    }


    // eslint-disable-next-line default-param-last
    constructor(readonly errorCode: EC, message: ExceptionMsg<EC>, _context: Context ={}, cause?: unknown ){
        super(`${errorCode}: ${message}`, {cause})
        let stackCodes : Array<ExceptionCode> = [errorCode]
        let context = _context
        if (cause instanceof Exception){
            context = deepmerge(cause.context, context)
            stackCodes = deepmerge(stackCodes, cause.stackCodes)
        }
        this.context = context
        // eslint-disable-next-line no-underscore-dangle
        this._stackCodes = stackCodes
    }

    toJSON(): StdDictError {
        return {
            message: this.message,
            context: this.context,
            stack: this.stack,
            cause: Exception.getStdDict(this.cause)
        }
    }
    static getStdDict(err:unknown): StdDictError {
        if (err instanceof Exception){
            return err.toJSON()
        }
        if (err instanceof Error || err instanceof TypeError) {
            return {
                message: err.message,
                stack: err.stack,
                cause: Exception.getStdDict(err)
            }
        }
        return {
            message: `${typeof err} as error: ${err}`
        }
    }
}

export class HttpException<EC extends ExceptionCode=ExceptionCode> extends Exception {
    // eslint-disable-next-line default-param-last
    constructor(errorCode: EC, readonly statusCode: number, message: ExceptionMsg<EC>, context: Context = {}, cause?: unknown ){
        super(errorCode, message, context, cause)
    }
}
