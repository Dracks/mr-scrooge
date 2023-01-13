import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { BankMovementAttributes } from "../models/bank-movement.model";

@ObjectType()
export class BankMovement implements Omit<BankMovementAttributes, 'pageKey'>{
    
    @Field(()=>Int)
    id!: number
    
    @Field(()=>String)
    movementName!: string;

    @Field(()=>Date)
    date!: Date;

    @Field(()=>Date, {nullable: true})
    dateValue?: Date;

    @Field(()=>String, {nullable: true})
    details?: string;

    @Field(()=>Float)
    value!: number;

    @Field(()=>String)
    kind!: string;

    @Field(()=>String, {nullable: true})
    description?: string;
        
}