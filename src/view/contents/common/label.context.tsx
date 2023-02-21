import React, { PropsWithChildren, useContext } from 'react';
import { GQLLabel, useGetLabelsQuery } from '../../api/graphql/generated';

import ErrorHandler from '../../api/helpers/request-error.handler';
import { LoadingPage } from '../../utils/ui/loading';

interface ILabelContext {
    refresh: () => Promise<void>;
    labels: GQLLabel[];
    labelsMap: Record<number, GQLLabel>;
}

const LabelContext = React.createContext<ILabelContext>({
    labels: [],
    labelsMap: {},
    refresh: () => Promise.resolve(),
});

export const useLabelsListContext = (): GQLLabel[] => {
    const { labels } = useContext(LabelContext);
    return labels;
};

export const useLabelsContext = (): ILabelContext => useContext(LabelContext);

const useGenerateHash = (labels: GQLLabel[]): Record<number, GQLLabel> => {
    return React.useMemo(
        () =>
            labels.reduce((ac, tag) => {
                ac[tag.id] = tag;
                return ac;
            }, {} as Record<number, GQLLabel>),
        [labels],
    );
};

export const ProvideLabelsData: React.FC<PropsWithChildren> = ({ children }) => {
    const [query, refresh] = useGetLabelsQuery();
    const labelsMap = useGenerateHash(query.data?.labels ?? []);

    if (query.data && !query.error) {
        const context: ILabelContext = {
            labels: query.data.labels,
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
