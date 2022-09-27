import { Box, Select, Text } from 'grommet';
import { Attachment, CircleAlert, StatusCritical, Upgrade } from 'grommet-icons';
import React from 'react';

import { Kind } from '../../../api/client/imports/types';
import { FileStatus, IFileData } from '../types';

interface ImportFileRowArgs {
    fileData: IFileData;
    kindsList: Kind[];
    onKindSwitch: (kind: string) => void;
    onRemove: () => void;
}

const STATUS_HASH: Record<FileStatus, React.FC<{}>> = {
    [FileStatus.error]: () => <StatusCritical color="error" />,
    [FileStatus.load]: () => <CircleAlert color="blue" />,
    [FileStatus.upload]: () => <CircleAlert color="green" />,
    [FileStatus.uploading]: () => <Upgrade color="yellow" />,
};

export const ImportFileRow: React.FC<ImportFileRowArgs> = ({ fileData, kindsList, onKindSwitch }) => {
    const Status = STATUS_HASH[fileData.status];
    return (
        <Box direction="row">
            <Attachment />
            <Box width="small">
                <Text truncate="tip">{fileData.file.name}</Text>
            </Box>
            <Select
                options={kindsList.map(kind => kind.name)}
                value={fileData.kind}
                onChange={event => onKindSwitch(event.value)}
            />

            <Status />
        </Box>
    );
};
