import { Button, Table, TableCell, TableHeader, TableRow } from 'grommet';
import { Add } from 'grommet-icons';
import React from 'react';

import { useGetFilterConditionals } from '../../../api/client/tag-filter/use-get-conditionals-filters';
import { useGetTagFilters } from '../../../api/client/tag-filter/use-get-tag-filters';
import { LoadingPage } from '../../../utils/ui/loading';
import { FiltersTableList } from './filters-list.edit';

interface FiltersListArgs {
    tagId: number;
}

export const FiltersList: React.FC<FiltersListArgs> = ({ tagId }) => {
    const [tagFiltersRequest, request] = useGetTagFilters(tagId);
    const [conditionalsRequest] = useGetFilterConditionals();
    if (tagFiltersRequest.data && conditionalsRequest.data) {
        return (
            <FiltersTableList
                filters={tagFiltersRequest.data}
                conditions={conditionalsRequest.data}
                reloadFilters={async () => {
                    await request();
                }}
                tagId={tagId}
            />
        );
    } else if (tagFiltersRequest.loading || conditionalsRequest.loading) {
        return <LoadingPage />;
    }
    return <div> Some error </div>;
};
