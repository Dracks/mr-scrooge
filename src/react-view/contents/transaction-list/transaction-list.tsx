import { InfiniteScroll, Select, Table, TableBody, TableCell, TableHeader, TableRow, TextInput } from 'grommet';
import React, { useState } from 'react';
import { useAsync } from 'react-async-hook';

import { useApi } from '../../api/client';
import { useLabelsListContext } from '../common/label.context';
import { BankTransactionEnriched, useTransactionsData } from '../common/transaction.context';
import { TransactionRow } from './transaction-row';

interface TransactionListFilters {
    kind?: string;
    label?: number;
    movement?: string;
}

export const TransactionList: React.FC = () => {
    const { data: results, replace } = useTransactionsData();
    const client = useApi()
    const kindRequest = useAsync(()=>client.GET("/imports/parsers"));
    const labels = useLabelsListContext();
    const [filters, setFilters] = useState<TransactionListFilters>({});

    let filteredResults = results;
    if (filters.kind) {
        filteredResults = filteredResults.filter(({ kind }) => kind === filters.kind);
    }

    if (filters.label) {
        filteredResults = filteredResults.filter(({ labelIds: transactionLabels }) =>
            transactionLabels.includes(filters.label as number),
        );
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
                        {
                            <Select
                                placeholder="Filter by importer"
                                options={['', ...(kindRequest.result?.data?.importKinds ?? []).map((kind: {name: string}) => kind.name)]}
                                value={filters.kind}
                                onChange={({ option }) => {
                                    setFilters({ ...filters, kind: option as string });
                                }}
                            />
                        }
                    </TableCell>
                    <TableCell scope="col" border="bottom">
                        Tags
                        <br />
                        <Select
                            placeholder="Filter by tag"
                            options={[{}, ...labels]}
                            labelKey="name"
                            valueKey={{ key: 'id', reduce: true }}
                            value={filters.label as unknown as string}
                            onChange={({ value: label }) => {
                                setFilters({ ...filters, label });
                            }}
                        />
                    </TableCell>
                    <TableCell scope="col" border="bottom">
                        Movement name <br />
                        <TextInput
                            placeholder="Search movement"
                            value={filters.movement}
                            onChange={event => {
                                setFilters({
                                    ...filters,
                                    movement: event.target.value,
                                });
                            }}
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
                    {(result: BankTransactionEnriched) => (
                        <TransactionRow transaction={result} labels={labels} onChange={replace} key={result.id} />
                    )}
                </InfiniteScroll>
            </TableBody>
        </Table>
    );
};
