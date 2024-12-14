import { Box, Button, Select, Text } from 'grommet';
import { Attachment, CircleAlert, StatusCritical, Trash, Upgrade } from 'grommet-icons';
import React from 'react';

import { FileParserType } from '../../../api/models';
import { FileStatus, IFileData } from '../types';

interface ImportFileRowArgs {
    fileData: IFileData;
    kindsList: FileParserType[];
    onKindSwitch: (kind: string) => void;
    onRemove: () => void;
}

const STATUS_HASH: Record<FileStatus, React.FC> = {
    [FileStatus.error]: () => <StatusCritical color="error" />,
    [FileStatus.load]: () => <CircleAlert color="blue" />,
    [FileStatus.upload]: () => <CircleAlert color="green" />,
    [FileStatus.uploading]: () => <Upgrade color="yellow" />,
};

export const ImportFileRow: React.FC<ImportFileRowArgs> = ({ fileData, kindsList, onKindSwitch, onRemove }) => {
    const Status = STATUS_HASH[fileData.status];
    return (
        <Box direction="row" align="center">
            <Attachment />
            <Box width="small">
                <Text truncate="tip">{fileData.file.name}</Text>
            </Box>
            <Select
                options={kindsList.map(kind => kind.name)}
                value={fileData.kind}
                onChange={event => {
                    if (typeof event === "object" && "value" in event) {
                        onKindSwitch((event as { value: string }) .value);
                    }
                }}
            />
            <Button
                icon={<Trash />}
                disabled={fileData.status !== FileStatus.load}
                onClick={() => {
                    onRemove();
                }}
            />

            <Status />
        </Box>
    );
};
