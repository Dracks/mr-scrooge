import { InfiniteScroll, Select, Table, TableBody, TableCell, TableHeader, TableRow, TextInput } from 'grommet';
import React, { useState } from 'react';

import { useGetKinds } from '../../api/client/imports/use-get-kind';
import { RdsEnriched, useRdsData } from '../common/raw-data-source.context';
import { useTagsListContext } from '../common/tag.context';
import { RawDataRow } from './raw-data-row';

interface RawDataListFilters {
    kind?: string;
    movement?: string;
    tag?: number;
}

export const RawDataList: React.FC = () => {
    const { data: results, replace } = useRdsData();
    const [kindRequest] = useGetKinds();
    const tags = useTagsListContext();
    const [filters, setFilters] = useState<RawDataListFilters>({});

    let filteredResults = results;
    if (filters.kind) {
        filteredResults = filteredResults.filter(({ kind }) => kind === filters.kind);
    }

    if (filters.tag) {
        filteredResults = filteredResults.filter(({ tags }) => tags.includes(filters.tag as number));
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
                        <Select
                            placeholder="Filter by importer"
                            options={['', ...(kindRequest.data ?? []).map(kind => kind.name)]}
                            value={filters.kind}
                            onChange={({ option }) => setFilters({ ...filters, kind: option })}
                        />
                    </TableCell>
                    <TableCell scope="col" border="bottom">
                        Tags
                        <br />
                        <Select
                            placeholder="Filter by tag"
                            options={[{}, ...tags]}
                            labelKey="name"
                            valueKey={{ key: 'id', reduce: true }}
                            value={filters.tag as unknown as string}
                            onChange={({ value: tag }) => setFilters({ ...filters, tag })}
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
                    {(result: RdsEnriched) => (
                        <RawDataRow rds={result} tags={tags} onChange={replace} key={result.id} />
                    )}
                </InfiniteScroll>
            </TableBody>
        </Table>
    );
};
