import { Box, Heading, Notification, Table, TableBody, TableCell, TableHeader, TableRow, Text } from 'grommet';
import React from 'react';

import { StatusReport, StatusReportRow } from '../../../api/client/imports/types';

interface ImportDetailsArgs {
    rows: StatusReportRow[];
    status: StatusReport;
}

const DetailsMessage: React.FC<{ description: string; status: StatusReport['status'] }> = ({ description, status }) => {
    switch (status) {
        case 'e':
            return <Notification status="critical" title="Error" message={description} />;
        case 'w':
            return <Notification status="warning" title="Warning" message={description} />;
        default:
            return <Notification title="" message={description} />;
    }
};

export const DetailsLoaded: React.FC<ImportDetailsArgs> = ({ status, rows }) => {
    return (
        <Box fill pad="small">
            <Heading level="2">{status.fileName}</Heading>
            <Text>{status.date}</Text>
            {status.description && <DetailsMessage description={status.description} status={status.status} />}
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
