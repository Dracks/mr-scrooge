import React, { PropsWithChildren, useContext } from 'react';

import { useApiClient } from '../../api/client';
import { ApiUUID, Label } from '../../api/models';
import { usePagination } from '../../api/pagination';
import { LoadingPage } from '../../utils/ui/loading';

interface ILabelContext {
    labels: Label[];
    labelsMap: Map<string, Label>;
    refresh: () => void;
    replace: (data: Label) => void;
    delete: (data: Label) => void;
}

const LabelContext = React.createContext<ILabelContext>({
    labels: [],
    labelsMap: new Map<string, Label>(),
    refresh: () => undefined,
    replace: () => undefined,
    delete: () => undefined,
});

export const useLabelsListContext = (): Label[] => {
    const { labels } = useContext(LabelContext);
    return labels;
};

export const useLabelsContext = (): ILabelContext => useContext(LabelContext);

const useGenerateHash = (labels: Label[]): Map<ApiUUID, Label> => {
    return React.useMemo(() => new Map(labels.map(label => [label.id, label])), [labels]);
};

export const ProvideLabelsData: React.FC<PropsWithChildren> = ({ children }) => {
    const client = useApiClient();
    const paginator = usePagination(
        async next => {
            const { data } = await client.GET('/labels', { params: { query: { cursor: next } } });
            if (data) {
                return data;
            } else {
                throw new Error('Failed to fetch labels: Response data is missing');
            }
        },
        { autostart: true, hash: (label: Label) => label.id },
    );
    const labelsMap = useGenerateHash(paginator.loadedData);

    if (paginator.status === 'completed') {
        const context: ILabelContext = {
            labels: paginator.loadedData,
            labelsMap,
            refresh: () => {
                paginator.reset();
            },
            replace: data => {
                paginator.update([data]);
            },
            delete: data => {
                paginator.deleteElement(data);
                paginator.reset();
            },
        };
        return <LabelContext.Provider value={context}>{children}</LabelContext.Provider>;
    } else if (paginator.status === 'loading') {
        return <LoadingPage />;
    }
    return <div>Error on loading the labels</div>;
};
