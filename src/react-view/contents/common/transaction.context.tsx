import React, { PropsWithChildren, useContext } from 'react';

import { useApi } from '../../api/client';
import { BankTransaction, Label } from '../../api/models';
import { usePagination } from '../../api/pagination';
import { EventTypes, useEventEmitter } from '../../utils/providers/event-emitter.provider';
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

export const ProvideTransactionsData: React.FC<PropsWithChildren> = ({ children }) => {
    const client = useApi()
    const labels = useLabelsListContext();

    const enrichTransactions = (rds: BankTransaction) => ({
        ...rds,
        date: new Date(rds.date),
        labelsComplete: rds.labelIds.map(labelId => labels.find(({ id }) => id === labelId) as Label),
    });
    const paginator = usePagination(async (next) => {
        console.log(next)
        const response = await client.GET("/bank-transactions", { params: { query: { cursor: next } } })
        const results = response.data?.results ?? []
        return {
            ...response.data,
            results: results.map(enrichTransactions)
        }
    }, {autostart: true, hash: (bt: BankTransactionEnriched) => bt.id})

    const eventEmitter = useEventEmitter();
    React.useEffect(() => {
        const unsub = eventEmitter.subscribe(EventTypes.OnQueueUploadFinish,
            paginator.reset);

        return unsub;
    }, [paginator.reset]);

    if (paginator.status === "error") {
        return <div>Some Error happened loading Bank Transactions </div>//<ErrorHandler error={query.error} />;
    }
    const context: BankTransactionsContextType = {
        data: paginator.loadedData,
        reset: paginator.reset,
        replace: data => {
            paginator.process([enrichTransactions(data)])
        },
    };
    return <TransactionsContext.Provider value={context}>{children}</TransactionsContext.Provider>;
};
