import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";

import { ConditionalTypeEnum } from "../models/condition.model";

registerEnumType(ConditionalTypeEnum, {
    name: 'ConditionalTypeEnum'
})

@ObjectType()
export class Condition {
    @Field(()=>Int)
    id!: number;

    @Field(()=>ConditionalTypeEnum)
    typeCondition!: ConditionalTypeEnum;

    @Field()
    conditional!: string;
}