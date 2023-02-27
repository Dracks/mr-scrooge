import { Field, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class ImportKind {
    @Field(()=>String)
    name!: string

    @Field(()=>String)
    regex!: string
}
