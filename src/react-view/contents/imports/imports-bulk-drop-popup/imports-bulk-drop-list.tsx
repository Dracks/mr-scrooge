import { subDays, subMonths } from 'date-fns';
import { Box, Button, CheckBox, Heading, Select, Text } from 'grommet';
import React, { useMemo, useState } from 'react';

import type { FileImport } from '../../../api/models';
import { DEBUG } from '../../../constants';

const THRESHOLD_OPTIONS = ['all', '5 days', '15 days', '1 month', '6 months', '1 year'] as const;
type Threshold = (typeof THRESHOLD_OPTIONS)[number];

function computeCutoff(threshold: Threshold): Date {
    switch (threshold) {
        case '5 days':
            return subDays(new Date(), 5);
        case '15 days':
            return subDays(new Date(), 15);
        case '1 month':
            return subMonths(new Date(), 1);
        case '6 months':
            return subMonths(new Date(), 6);
        case '1 year':
            return subMonths(new Date(), 12);
        case 'all':
            return new Date('9999-12-31');
        default:
            return subMonths(new Date(), 1);
    }
}

interface ImportBulkDropListProps {
    allImports: FileImport[];
    onDelete: (ids: Set<string>) => void;
    onCancel: () => void;
}

export const ImportBulkDropList: React.FC<ImportBulkDropListProps> = ({ allImports, onDelete, onCancel }) => {
    const [threshold, setThreshold] = useState<Threshold>('1 month');
    const cutoffDate = useMemo(() => computeCutoff(threshold), [threshold]);
    const oldImports = useMemo(
        () => allImports.filter(imp => new Date(imp.createdAt) < cutoffDate),
        [allImports, cutoffDate],
    );

    const [selected, setSelected] = useState<Set<string>>(new Set());

    const allSelected = selected.size === oldImports.length && oldImports.length > 0;

    const toggleAll = () => {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(oldImports.map(imp => imp.id)));
        }
    };

    const toggleOne = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <>
            <Box direction="row" align="center" gap="small">
                <Heading level={3}>Drop old imports</Heading>
                <Select
                    options={THRESHOLD_OPTIONS.filter(option => option !== 'all' || DEBUG)}
                    value={threshold}
                    onChange={({ option }) => {
                        if (option) {
                            setThreshold(option as Threshold);
                            setSelected(new Set());
                        }
                    }}
                />
                <Text>({oldImports.length} found)</Text>
            </Box>
            {oldImports.length === 0 ? (
                <Text>No imports older than {threshold}.</Text>
            ) : (
                <>
                    <CheckBox
                        label={`Select All (${String(oldImports.length)})`}
                        checked={allSelected}
                        onChange={toggleAll}
                    />
                    <Box overflow="auto" height={{ max: '300px' }} gap="xsmall">
                        {oldImports.map(imp => (
                            <CheckBox
                                key={imp.id}
                                label={`${imp.fileName} — ${new Date(imp.createdAt).toLocaleDateString()}`}
                                checked={selected.has(imp.id)}
                                onChange={() => {
                                    toggleOne(imp.id);
                                }}
                            />
                        ))}
                    </Box>
                    <Box direction="row" gap="small" justify="end">
                        <Button label="Cancel" onClick={onCancel} />
                        <Button
                            primary
                            label={`Delete Selected (${String(selected.size)})`}
                            disabled={selected.size === 0}
                            onClick={() => {
                                onDelete(selected);
                            }}
                            color="accent-4"
                        />
                    </Box>
                </>
            )}
        </>
    );
};
