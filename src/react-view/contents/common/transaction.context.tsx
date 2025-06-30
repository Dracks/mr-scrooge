import React, { PropsWithChildren, useContext } from 'react';

import { useApiClient } from '../../api/client';
import { BankTransaction, Label } from '../../api/models';
import { usePagination } from '../../api/pagination';
import { TRANSACTION_REFRESH_RATE } from '../../constants';
import { EventTypes, useEventEmitter } from '../../utils/providers/event-emitter.provider';
import { useThrottledData } from '../../utils/use-throttle-data';
import { useLabelsListContext } from './label.context';

export type BankTransactionEnriched = Omit<BankTransaction, 'date'> & {
    date: Date;
    labelsComplete: Label[];
};

export interface BankTransactionsContextType {
    data: BankTransactionEnriched[];
    replace: (data: BankTransaction) => void;
    reset: () => void;
}

const TransactionsContext = React.createContext<BankTransactionsContextType>({
    data: [],
    reset: () => undefined,
    replace: () => undefined,
});

export const useTransactionsData = (): BankTransactionsContextType => useContext(TransactionsContext);

export const useThrottledTransactionsData = (): BankTransactionEnriched[] => {
    const { data } = useContext(TransactionsContext);

    return useThrottledData(data, TRANSACTION_REFRESH_RATE);
};

export const ProvideTransactionsData: React.FC<PropsWithChildren> = ({ children }) => {
    const client = useApiClient();
    const labels = useLabelsListContext();

    const enrichTransactions = (rds: BankTransaction) => ({
        ...rds,
        date: new Date(rds.date),
        labelsComplete: rds.labelIds.map(labelId => labels.find(({ id }) => id === labelId) as Label),
    });
    const paginator = usePagination(
        async next => {
            const response = await client.GET('/bank-transactions', { params: { query: { cursor: next } } });
            const results = response.data?.results ?? [];
            return {
                ...response.data,
                results: results.map(enrichTransactions),
            };
        },
        { autostart: true, hash: (bt: BankTransactionEnriched) => bt.id },
    );

    const eventEmitter = useEventEmitter();
    React.useEffect(() => {
        const unsub = eventEmitter.subscribe(EventTypes.OnQueueUploadFinish, paginator.reset);

        return unsub;
    }, [paginator.reset]);

    if (paginator.status === 'error') {
        return <div>Some Error happened loading Bank Transactions </div>; //<ErrorHandler error={query.error} />;
    }
    const context: BankTransactionsContextType = {
        data: paginator.loadedData,
        reset: paginator.reset,
        replace: data => {
            paginator.update([enrichTransactions(data)]);
        },
    };
    return <TransactionsContext.Provider value={context}>{children}</TransactionsContext.Provider>;
};
