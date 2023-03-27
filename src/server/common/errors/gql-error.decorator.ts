import { createUnionType, Field } from "@nestjs/graphql"
import { Class, Constructor } from "type-fest"
export type ClassDecorator<T> = <TCtor extends Constructor<T>>(target: TCtor) => TCtor

export const ERROR_METADATA_KEY='GQL_ERROR_METADATA_KEY'


export class GQLBaseError {
    error!: string
}

export const GQLError = <T extends string, C extends GQLBaseError>(error: T):ClassDecorator<C> => (target) => {
    Field(()=>String)(target, 'error')
    Reflect.defineMetadata(ERROR_METADATA_KEY, error, target)

    return target
}

export const GQLErrorFactory = <T extends GQLBaseError>(target: Constructor<T>) =>
    (data: Omit<T, 'error'>): T => {
        const error = Reflect.getMetadata(ERROR_METADATA_KEY, target)
        return {
        error,
        ...data,
    } as T
}




export const GenerateResponseUnion = <T>(name: string, ok: Class<T>, errors: Class<GQLBaseError>[]) => {
    const errorsMap = new Map(errors.map(error => {
        const metadata = Reflect.getMetadata(ERROR_METADATA_KEY, error)
        return [metadata, error]
    }))
    return createUnionType({
        name,
        types: ()=>[ok, ...errors],
        resolveType(value) {
            const {error} = value as {error: string}
            if (error){
                const errorType = errorsMap.get(error)
                if (errorType){
                    return errorType
                } 
                    throw new Error(`Invalid error type ${error} in union ${name}`)
                
            }
            return ok
        }
    })
}
