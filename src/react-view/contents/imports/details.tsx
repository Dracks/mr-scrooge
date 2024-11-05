import { Box, Heading, Notification, Table, TableBody, TableCell, TableHeader, TableRow, Text } from 'grommet';
import React from 'react';

import { FileImport } from '../../api/models';

interface ImportDetailsArgs {
    status: FileImport;
}

const DetailsMessage: React.FC<{ description: string; status: FileImport['status'] }> = ({ description, status }) => {
    switch (status) {
        case 'error':
            return <Notification status="critical" title="Error" message={description} />;
        case 'warning':
            return <Notification status="warning" title="Warning" message={description} />;
        default:
            return <Notification title="" message={description} />;
    }
};

export const ImportDetails: React.FC<ImportDetailsArgs> = ({ status }) => {
    const {rows} = status
    return (
        <Box fill pad="small">
            <Heading level="2">{status.fileName}</Heading>
            <Text>{status.createdAt}</Text>
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
                    {rows.map((row, idx) => (
                        <TableRow key={`${String(idx)}-${row.movementName}`}>
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
