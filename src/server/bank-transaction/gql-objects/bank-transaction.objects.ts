import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { DateOnly } from '../../common/custom-types/date-only';
import { GQLDateOnly } from '../../common/custom-types/gql-date-only';
import { IBankTransaction } from '../models/bank-transaction.model';

@ObjectType()
export class BankTransaction implements Omit<IBankTransaction, 'pageKey' | 'date' | 'dateValue' | 'groupOwnerId'> {
    @Field(() => Int)
    id!: number;

    @Field(() => Int)
    groupOwnerId!: number;

    @Field(() => String)
    movementName!: string;

    @Field(() => GQLDateOnly)
    date!: DateOnly;

    @Field(() => GQLDateOnly, { nullable: true })
    dateValue?: DateOnly;

    @Field(() => String, { nullable: true })
    details?: string;

    @Field(() => Float)
    value!: number;

    @Field(() => String)
    kind!: string;

    @Field(() => String, { nullable: true })
    description?: string;
}
