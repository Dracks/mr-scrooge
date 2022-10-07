import { Select, TableCell, TableRow, TextInput } from 'grommet';
import React from 'react';

import { TagFilter } from '../../../api/client/tag-filter/types';
import { useDeleteTagFilter } from '../../../api/client/tag-filter/use-delete-tag-filter';
import { usePutTagFilter } from '../../../api/client/tag-filter/use-put-tag-filter';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { ConditionsType } from './filter-tag.types';

interface FilterListRowArgs {
    conditions: Array<ConditionsType>;
    filter: TagFilter;
    reloadFilters: () => Promise<void>;
}

export const FilterListRow: React.FC<FilterListRowArgs> = ({ filter, conditions, reloadFilters }) => {
    const [, updateFilter] = usePutTagFilter(filter.id);
    const [, deleteRequest] = useDeleteTagFilter(filter.id);
    const [viewFilter, setViewFilter] = React.useState<TagFilter>(filter);
    const update = (data: TagFilter) =>
        updateFilter({
            data,
        }).then(() => reloadFilters());

    React.useEffect(() => {
        setViewFilter(filter);
    }, [filter.id]);

    return (
        <TableRow>
            <TableCell>
                <Select
                    options={conditions}
                    id="select-condition-type"
                    name="parent"
                    value={viewFilter.typeConditional}
                    labelKey="value"
                    valueKey={{ key: 'key', reduce: true }}
                    onChange={({ option }: { option: ConditionsType }) => {
                        const newData = {
                            ...viewFilter,
                            typeConditional: option.key,
                        };
                        setViewFilter(newData);
                        update(newData);
                    }}
                />
            </TableCell>
            <TableCell>
                <TextInput
                    id="text-input-name"
                    name="conditional"
                    value={viewFilter.conditional}
                    onChange={ev => {
                        setViewFilter({
                            ...viewFilter,
                            conditional: ev.target.value,
                        });
                    }}
                    onBlur={ev => {
                        update(viewFilter);
                    }}
                />
            </TableCell>
            <TableCell>
                <ConfirmationButton
                    label="Delete"
                    color="accent-4"
                    onConfirm={() => {
                        deleteRequest().then(reloadFilters);
                    }}
                />
            </TableCell>
        </TableRow>
    );
};
