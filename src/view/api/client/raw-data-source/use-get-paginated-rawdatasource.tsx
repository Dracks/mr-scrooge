import {
    GetBankTransactionsDocument,
    GQLBankTransaction,
    GQLGetBankTransactionsQuery,
    GQLGetBankTransactionsQueryVariables,
} from '../../graphql/generated';
import { CursorPaginationResult, useCursorPaginationQuery } from '../common/use-cursor-pagination';

export const useGetPaginatedRawDataSource = (): CursorPaginationResult<GQLBankTransaction> =>
    useCursorPaginationQuery<GQLGetBankTransactionsQuery, GQLGetBankTransactionsQueryVariables, GQLBankTransaction>(
        {
            query: GetBankTransactionsDocument,
            variables: {
                limit: 100,
            },
        },
        'bankTransaction',
    );
