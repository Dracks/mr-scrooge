import React, { PropsWithChildren, useContext } from 'react';

import { useGetPaginatedRawDataSource } from '../../api/client/raw-data-source/use-get-paginated-rawdatasource';
import { GQLBankTransaction, GQLLabel } from '../../api/graphql/generated';
import ErrorHandler from '../../api/helpers/request-error.handler';
import { EventTypes, useEventEmitter } from '../../utils/providers/event-emitter.provider';
import { useLabelsListContext } from './label.context';

export type TransactionsEnriched = Omit<GQLBankTransaction, 'date'> & {
    date: Date;
    labelsComplete: GQLLabel[];
};

export interface RdsContextType {
    data: TransactionsEnriched[];
    replace: (data: GQLBankTransaction) => void;
    reset: () => void;
}

const RdsContext = React.createContext<RdsContextType>({
    data: [],
    reset: () => undefined,
    replace: () => undefined,
});

export const useRdsData = (): RdsContextType => useContext(RdsContext);

const replaceOrAdd = (state: TransactionsEnriched[], stateIndexes: number[]) => (rds: TransactionsEnriched) => {
    const index = stateIndexes.indexOf(rds.id);
    if (index < 0) {
        state.push(rds);
        stateIndexes.push(rds.id);
    } else {
        state[index] = rds;
    }
};

export const ProvideRdsData: React.FC<PropsWithChildren> = ({ children }) => {
    const [state, setState] = React.useState<{
        data: TransactionsEnriched[];
        index: number[];
    }>({ data: [], index: [] });
    const eventEmitter = useEventEmitter();
    const labels = useLabelsListContext();
    const query = useGetPaginatedRawDataSource();
    const enrichTransactions = (rds: GQLBankTransaction) => ({
        ...rds,
        date: new Date(rds.date),
        labelsComplete: rds.labelIds.map(labelId => labels.find(({ id }) => id === labelId) as GQLLabel),
    });

    React.useEffect(() => {
        if (!query.loading && query.results && !query.error) {
            const newState = [...state.data];
            const stateIndexes = state.index;

            query.results.map(enrichTransactions).forEach(replaceOrAdd(newState, stateIndexes));
            setState({ data: newState, index: stateIndexes });
            if (query.next) {
                query.next();
            }
        }
    }, [query.loading, query.results]);

    React.useEffect(() => {
        const unSubscribe = eventEmitter.subscribe(EventTypes.OnQueueUploadFinish, () => {
            query.reset();
        });

        return unSubscribe;
    });

    if (query.error) {
        return <ErrorHandler error={query.error} />;
    }
    const context: RdsContextType = {
        data: state.data,
        reset: query.reset,
        replace: data => {
            const newState = [...state.data];
            replaceOrAdd(newState, state.index)(enrichTransactions(data));
            setState({ data: newState, index: state.index });
        },
    };
    return <RdsContext.Provider value={context}>{children}</RdsContext.Provider>;
};
