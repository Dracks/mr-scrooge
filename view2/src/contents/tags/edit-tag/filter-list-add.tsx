import { Button, Select, TableCell, TableRow, TextInput } from 'grommet';
import React from 'react';

import { TagFilter } from '../../../api/client/tag-filter/types';
import { usePostTagFilter } from '../../../api/client/tag-filter/use-post-tag-filter';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { ConditionsType } from './filter-tag.types';

interface FilterListAddArgs {
    close: () => void;
    conditions: Array<ConditionsType>;
    reloadFilters: () => Promise<void>;
    tagId: number;
}

export const FilterListAddArgs: React.FC<FilterListAddArgs> = ({ conditions, tagId, reloadFilters, close }) => {
    const [, request] = usePostTagFilter();
    const [viewFilter, setViewFilter] = React.useState<Partial<TagFilter>>({
        tag: tagId,
    });
    React.useEffect(() => {
        setViewFilter({ tag: tagId });
    }, [tagId]);
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
                />
            </TableCell>
            <TableCell>
                <Button
                    label="Save"
                    primary
                    disabled={!viewFilter.conditional || !viewFilter.typeConditional}
                    onClick={() => {
                        request({
                            data: viewFilter,
                        }).then(() => {
                            close();
                            reloadFilters();
                        });
                    }}
                />
                <ConfirmationButton label="Cancel" onConfirm={close} color="accent-4" />
            </TableCell>
        </TableRow>
    );
};
