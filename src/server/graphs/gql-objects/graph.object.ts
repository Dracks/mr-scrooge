import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { GraphGroup, GraphKind } from "../models/graph.model";
registerEnumType(GraphKind, {
    name: "GraphKind",
})
registerEnumType(GraphGroup, {
    name: "GraphGroup",
})

@ObjectType()
export class Group {
    @Field(()=>GraphGroup)
    group!: GraphGroup

    @Field({nullable: true})
    hideOthers!: boolean

    @Field(()=>[Int], {nullable: true})
    labels?: number[]
}


@ObjectType()
export class HorizontalGroup extends Group{
    @Field({nullable: true})
    accumulate?: boolean
}

@ObjectType()
export class Graph {
    @Field(()=>Int)
    id!: number;

    @Field(()=>Int)
    groupOwnerId!: number;

    @Field()
    name!: string
    @Field(()=>GraphKind)
    kind!: GraphKind;

    @Field({nullable: true})
    tagFilter?: number;

    @Field()
    dateRange!: string;

    @Field(()=>Group)
    group!: Group;

    @Field(()=>HorizontalGroup, {nullable: true})
    horizontalGroup?: HorizontalGroup;
}