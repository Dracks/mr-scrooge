import React, { useContext } from 'react';

import { RawDataSource } from '../../api/client/raw-data-source/types';
import { useGetPaginatedRawDataSource } from '../../api/client/raw-data-source/use-get-paginated-rawdatasource';
import { Tag } from '../../api/client/tag/types';
import ErrorHandler from '../../api/helpers/request-error.handler';
import { EventTypes, useEventEmitter } from '../../utils/providers/event-emitter.provider';
import { useTagsListContext } from './tag.context';

export type RdsEnriched = Omit<RawDataSource, 'date'> & {
    date: Date;
    tagsComplete: Tag[];
};

export interface RdsContextType {
    data: RdsEnriched[];
    replace: (data: RawDataSource) => void;
    reset: () => void;
}

const RdsContext = React.createContext<RdsContextType>({
    data: [],
    reset: () => undefined,
    replace: () => undefined,
});

export const useRdsData = (): RdsContextType => useContext(RdsContext);

const replaceOrAdd = (state: RdsEnriched[], stateIndexes: number[]) => (rds: RdsEnriched) => {
    const index = stateIndexes.indexOf(rds.id);
    if (index < 0) {
        state.push(rds);
        stateIndexes.push(rds.id);
    } else {
        state[index] = rds;
    }
};

export const ProvideRdsData: React.FC = ({ children }) => {
    const [state, setState] = React.useState<{
        data: RdsEnriched[];
        index: number[];
    }>({ data: [], index: [] });
    const eventEmitter = useEventEmitter();
    const tags = useTagsListContext();
    const query = useGetPaginatedRawDataSource();
    const enrichRds = (rds: RawDataSource) => ({
        ...rds,
        date: new Date(rds.date),
        tagsComplete: rds.tags.map(tagId => tags.find(({ id }) => id === tagId) as Tag),
    });

    React.useEffect(() => {
        if (!query.loading && query.results && !query.error) {
            const newState = [...state.data];
            const stateIndexes = state.index;

            query.results.map(enrichRds).forEach(replaceOrAdd(newState, stateIndexes));
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
            replaceOrAdd(newState, state.index)(enrichRds(data));
            setState({ data: newState, index: state.index });
        },
    };
    return <RdsContext.Provider value={context}>{children}</RdsContext.Provider>;
};
