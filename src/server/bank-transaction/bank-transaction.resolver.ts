import { Logger } from '@nestjs/common';
import { Args, Field, Int, ObjectType, Query, Resolver } from '@nestjs/graphql';

import { DateOnly } from '../common/custom-types/date-only';
import { BankTransactionService } from './bank-transaction.service';
import { BankTransaction } from './gql-objects/bank-transaction.objects';

@ObjectType()
export class GetBankTransactionsResponse {
    @Field(() => [BankTransaction])
    transactions!: BankTransaction[];

    @Field(() => String, { nullable: true })
    cursor?: string;
}

@Resolver(() => BankTransaction)
export class BankTransactionResolver {
    private readonly logger = new Logger(BankTransactionResolver.name);

    constructor(readonly bankMovementService: BankTransactionService) {}

    @Query(() => GetBankTransactionsResponse)
    async bankTransaction(
        @Args('cursor', { nullable: true }) oldCursor: string,
        @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    ): Promise<GetBankTransactionsResponse> {
        const { list: movements, cursor } = await this.bankMovementService.getAll(oldCursor, limit);
        return {
            transactions: movements.map(movement => ({
                ...movement,
                date: new DateOnly(movement.date),
                dateValue: movement.dateValue ? new DateOnly(movement.dateValue) : undefined,
            })),
            cursor,
        };
    }
}
