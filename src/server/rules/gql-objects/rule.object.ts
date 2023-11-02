import { Field, Int, ObjectType } from "@nestjs/graphql";

import { Condition } from "./condition.object";

@ObjectType()
export class Rule {
    @Field(()=>Int)
    id!: number; 

    @Field(()=>Int)
    groupOwnerId!: number

    @Field()
    name!: string;

    @Field(()=>[Condition])
    conditions!: Condition[];
}