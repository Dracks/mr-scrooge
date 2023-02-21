import { InfiniteScroll, Select, Table, TableBody, TableCell, TableHeader, TableRow, TextInput } from 'grommet';
import React, { useState } from 'react';

import { useGetImportKindsQuery } from '../../api/graphql/generated';
import { useLabelsContext, useLabelsListContext } from '../common/label.context';
import { TransactionsEnriched, useRdsData } from '../common/raw-data-source.context';
import { RawDataRow } from './raw-data-row';

interface RawDataListFilters {
    kind?: string;
    movement?: string;
    label?: number;
}

// eslint-disable-next-line max-lines-per-function
export const RawDataList: React.FC = () => {
    const { data: results, replace } = useRdsData();
    const [kindRequest] = useGetImportKindsQuery();
    const tags = useLabelsListContext();
    const [filters, setFilters] = useState<RawDataListFilters>({});

    let filteredResults = results;
    if (filters.kind) {
        filteredResults = filteredResults.filter(({ kind }) => kind === filters.kind);
    }

    if (filters.label) {
        filteredResults = filteredResults.filter(({ labelIds: rdsLabels }) => rdsLabels.includes(filters.label as number));
    }

    if (filters.movement) {
        const movCheck = filters.movement.toLowerCase();
        filteredResults = filteredResults.filter(
            ({ movementName }) => movementName.toLowerCase().indexOf(movCheck) >= 0,
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableCell scope="col" border="bottom">
                        Kind
                        <br />
                        {<Select
                            placeholder="Filter by importer"
                            options={['', ...(kindRequest.data?.importKinds ?? []).map(kind => kind.name)]}
                            value={filters.kind}
                            onChange={({ option }) => setFilters({ ...filters, kind: option })}
                        />}
                    </TableCell>
                    <TableCell scope="col" border="bottom">
                        Tags
                        <br />
                        <Select
                            placeholder="Filter by tag"
                            options={[{}, ...tags]}
                            labelKey="name"
                            valueKey={{ key: 'id', reduce: true }}
                            value={filters.label as unknown as string}
                            onChange={({ value: label }) => setFilters({ ...filters, label })}
                        />
                    </TableCell>
                    <TableCell scope="col" border="bottom">
                        Movement name <br />
                        <TextInput
                            placeholder="Search movement"
                            value={filters.movement}
                            onChange={event =>
                                setFilters({
                                    ...filters,
                                    movement: event.target.value,
                                })
                            }
                        />
                    </TableCell>
                    <TableCell scope="col" border="bottom">
                        import
                    </TableCell>
                    <TableCell scope="col" border="bottom">
                        date
                    </TableCell>
                    <TableCell scope="col" border="bottom">
                        description
                    </TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                <InfiniteScroll items={filteredResults}>
                    {(result: TransactionsEnriched) => (
                        <RawDataRow rds={result} tags={tags} onChange={replace} key={result.id} />
                    )}
                </InfiniteScroll>
            </TableBody>
        </Table>
    );
};
