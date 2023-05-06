import { Field, InputType, Int } from "@nestjs/graphql";

import { GraphDateRange, GraphGroup, GraphKind } from "../models/graph.model";


@InputType()
export class MutateGroup {
    @Field(()=>GraphGroup)
    group!: GraphGroup

    @Field({nullable: true})
    hideOthers!: boolean

    @Field(()=>[Int], {nullable: true})
    labels?: number[]
}

@InputType()
export class MutateHorizontalGroup extends MutateGroup{
    @Field({nullable: true})
    accumulate?: boolean
}

@InputType()
export class NewGraph {
    @Field(()=>Int)
    groupOwnerId!: number;

    @Field()
    name!: string

    @Field(()=>GraphKind)
    kind!: GraphKind;

    @Field({nullable: true})
    labelFilter?: number;

    @Field(()=>GraphDateRange)
    dateRange!: GraphDateRange;

    @Field(()=>MutateGroup)
    group!: MutateGroup;

    @Field(()=>MutateHorizontalGroup, {nullable: true})
    horizontalGroup?: MutateHorizontalGroup;
}

@InputType()
export class UpdatedGraph {
    @Field(()=>Int)
    id!: number;

    @Field(()=>Int)
    groupOwnerId!: number;

    @Field()
    name!: string

    @Field(()=>GraphKind)
    kind!: GraphKind;

    @Field({nullable: true})
    labelFilter?: number;

    @Field(()=>GraphDateRange)
    dateRange!: GraphDateRange;

    @Field(()=>MutateGroup)
    group!: MutateGroup;

    @Field(()=>MutateHorizontalGroup, {nullable: true})
    horizontalGroup?: MutateHorizontalGroup;
}
