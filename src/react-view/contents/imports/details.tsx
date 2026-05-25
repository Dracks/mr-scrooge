import { Box, Heading, Notification, Table, TableBody, TableCell, TableHeader, TableRow, Text } from 'grommet';
import { ErrorResponse, ResponseObjectMap } from 'openapi-typescript-helpers';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApiClient } from '../../api/client';
import { paths } from '../../api/generated-models';
import { FileImport } from '../../api/models';
import { ConfirmationButton } from '../../utils/ui/confirmation-button';
import { WrapperApiError } from '../../utils/ui/errors/api-error-response';
import { isType } from '../../utils/ui/errors/is-type';
import { SmallErrorBox } from '../../utils/ui/errors/small-error-box';

interface ImportDetailsArgs {
    status: FileImport;
    onDeleted: (id: string) => void;
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

export const ImportDetails: React.FC<ImportDetailsArgs> = ({ status, onDeleted }) => {
    const client = useApiClient();
    const deleteImport = useAsyncCallback(async (id: string) => {
        const result = await client.DELETE('/imports/{id}', { params: { path: { id } } });
        if (result.response.ok) {
            onDeleted(id);
            return;
        }
        if (isType<ErrorResponse<ResponseObjectMap<paths['/imports/{id}']['delete']>>>(result.error)) {
            throw new WrapperApiError(result.error);
        }
        throw new Error(`HTTP ${String(result.response.status)}: ${result.response.statusText}`);
    });

    const { rows } = status;
    return (
        <Box fill pad="small">
            <Box direction="row" align="center" gap="small">
                <Heading level="2">{status.fileName}</Heading>
                <ConfirmationButton
                    color="accent-4"
                    label="Drop"
                    confirmationText="Are you sure you want to delete this import?"
                    onConfirm={() => {
                        void deleteImport.execute(status.id);
                    }}
                />
            </Box>
            {deleteImport.error ? <SmallErrorBox error={deleteImport.error} /> : null}
            <Text>{status.createdAt}</Text>
            {status.description ? <DetailsMessage description={status.description} status={status.status} /> : null}
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
