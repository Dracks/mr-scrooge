import { Logger } from '@nestjs/common';
import { Args, Field, Int, ObjectType, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { DateOnly } from '../common/custom-types/date-only';
import { LabelService } from '../graphs/services/label.service';
import { GqlGroupsId } from '../session/decorators/gql-groups-id';
import { BankTransactionService } from './bank-transaction.service';
import { BankTransaction } from './gql-objects/bank-transaction.objects';

@ObjectType()
export class GetBankTransactionsResponse {
    @Field(() => [BankTransaction])
    results!: BankTransaction[];

    @Field(() => String, { nullable: true })
    next?: string;
}

@Resolver(() => BankTransaction)
export class BankTransactionResolver {
    private readonly logger = new Logger(BankTransactionResolver.name);

    constructor(
        readonly bankMovementService: BankTransactionService,
        readonly labelService: LabelService,
    ) {}

    @Query(() => GetBankTransactionsResponse)
    async bankTransaction(
        @GqlGroupsId() groupIds: number[],
        @Args('cursor', { nullable: true }) oldCursor: string,
        @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    ): Promise<GetBankTransactionsResponse> {
        const { list: movements, next } = await this.bankMovementService.getAll(groupIds, oldCursor, limit);
        return {
            results: movements.map(movement => ({
                ...movement,
                date: new DateOnly(movement.date),
                dateValue: movement.dateValue ? new DateOnly(movement.dateValue) : undefined,
            })),
            next,
        };
    }

    @ResolveField(()=>[Int])
    labelIds(@Parent() parent: BankTransaction){
        const {id} = parent
        return this.labelService.getLabelsIdForTransaction(id)
    }
}