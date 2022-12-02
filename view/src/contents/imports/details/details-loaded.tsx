import { Box, Heading, Table, TableBody, TableCell, TableHeader, TableRow, Text } from 'grommet';
import React from 'react';

import { StatusReport, StatusReportRow } from '../../../api/client/imports/types';

interface ImportDetailsArgs {
    rows: StatusReportRow[];
    status: StatusReport;
}

export const DetailsLoaded: React.FC<ImportDetailsArgs> = ({ status, rows }) => {
    return (
        <Box fill>
            <Heading level="2">{status.fileName}</Heading>
            <Text>{status.date}</Text>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>movement</TableCell>
                        <TableCell>value</TableCell>
                        <TableCell>error/message</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(row => (
                        <TableRow key={row.id}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.movementName}</TableCell>
                            <TableCell>{row.value}</TableCell>
                            <TableCell>{row.message}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};
