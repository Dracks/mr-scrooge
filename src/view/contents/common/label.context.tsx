import React, { PropsWithChildren, useContext } from 'react';

import { GQLLabel, useGetLabelsQuery } from '../../api/graphql/generated';
import ErrorHandler from '../../api/helpers/request-error.handler';
import { LoadingPage } from '../../utils/ui/loading';

interface ILabelContext {
    labels: GQLLabel[];
    labelsMap: Map<number, GQLLabel>;
    refresh: () => Promise<void>;
}

const LabelContext = React.createContext<ILabelContext>({
    labels: [],
    labelsMap: new Map<number, GQLLabel>(),
    refresh: () => Promise.resolve(),
});

export const useLabelsListContext = (): GQLLabel[] => {
    const { labels } = useContext(LabelContext);
    return labels;
};

export const useLabelsContext = (): ILabelContext => useContext(LabelContext);

const useGenerateHash = (labels: GQLLabel[]): Map<number, GQLLabel> => {
    return React.useMemo(() => new Map(labels.map(label => [label.id, label])), [labels]);
};

export const ProvideLabelsData: React.FC<PropsWithChildren> = ({ children }) => {
    const [query, refresh] = useGetLabelsQuery();
    const labelsMap = useGenerateHash(query.data?.labels?.results ?? []);

    if (query.data && !query.error) {
        const context: ILabelContext = {
            labels: query.data.labels.results,
            labelsMap,
            refresh: async () => {
                await refresh();
            },
        };
        return <LabelContext.Provider value={context}>{children}</LabelContext.Provider>;
    } else if (query.fetching) {
        <LoadingPage />;
    } else if (query.error) {
        return <ErrorHandler error={query.error} />;
    }
    return <div />;
};
