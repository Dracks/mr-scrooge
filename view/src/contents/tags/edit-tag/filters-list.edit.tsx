import { Button, Table, TableBody, TableCell, TableHeader, TableRow } from 'grommet';
import { Add } from 'grommet-icons';
import React from 'react';

import { FilterConditional, TagFilter } from '../../../api/client/tag-filter/types';
import { FilterListAddArgs } from './filter-list-add';
import { FilterListRow } from './filter-list-row';

interface FiltersTableListArgs {
    conditions: Record<FilterConditional, string>;
    filters: TagFilter[];
    reloadFilters: () => Promise<void>;
    tagId: number;
}

export const FiltersTableList: React.FC<FiltersTableListArgs> = ({ filters, conditions, tagId, reloadFilters }) => {
    const [isAdding, setIsAdding] = React.useState(false);
    const conditionsList = React.useMemo(
        () =>
            Object.entries(conditions).map(([key, value]) => ({
                key: key as FilterConditional,
                value,
            })),
        [conditions],
    );
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableCell scope="col" border="bottom">
                        type
                    </TableCell>
                    <TableCell scope="col" border="bottom" size="2/3">
                        condition
                    </TableCell>
                    <TableCell>
                        Actions <Button icon={<Add size="small" />} onClick={() => setIsAdding(!isAdding)} />
                    </TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filters.map(filter => (
                    <FilterListRow
                        key={filter.id}
                        filter={filter}
                        conditions={conditionsList}
                        reloadFilters={reloadFilters}
                    />
                ))}
                {isAdding ? (
                    <FilterListAddArgs
                        conditions={conditionsList}
                        reloadFilters={reloadFilters}
                        tagId={tagId}
                        close={() => setIsAdding(false)}
                    />
                ) : undefined}
            </TableBody>
        </Table>
    );
};
