import { Box, Button, Heading } from 'grommet';
import { DocumentUpload } from 'grommet-icons';
import React from 'react';

import { useGetKinds } from '../../../api/client/imports/use-get-kind';
import { useLogger } from '../../../utils/logger/logger.context';
import { FileUploadQueue } from '../../../utils/ui/upload-queue';
import { useUploadQueue } from '../../common/uploader-queue.context';
import { ImportFileRow } from './import-file-row';

const useKindWithRegex = () => {
    const [kindResponse] = useGetKinds();
    const kindList = kindResponse.data ?? [];
    const regexCompiled = React.useMemo(
        // eslint-disable-next-line require-unicode-regexp
        () => kindList.map(k => ({ name: k.name, regex: new RegExp(k.regex) })),
        [kindList],
    );
    return {
        kindList,
        findKind: (fileName: string) => regexCompiled.find(rx => rx.regex.test(fileName))?.name ?? 'Unknown',
    };
};

export const ImportWizard: React.FC = () => {
    const { files, onAdd, onChangeKind, submit, uploading, onRemove } = useUploadQueue();
    const { kindList, findKind } = useKindWithRegex();
    const logger = useLogger();
    logger.info('Import wizard', { files });

    return (
        <Box fill align="center" justify="center">
            <Heading level="2">Import Files</Heading>
            {!uploading && (
                <FileUploadQueue
                    label="Upload files"
                    onAdd={newFiles =>
                        onAdd(
                            newFiles.map(file => ({
                                file,
                                kind: findKind(file.name),
                            })),
                        )
                    }
                />
            )}
            <Box>
                {files.map((data, idx) => (
                    <ImportFileRow
                        key={idx}
                        fileData={data}
                        onRemove={() => onRemove(data.id)}
                        onKindSwitch={kind => onChangeKind(data.id, kind)}
                        kindsList={kindList}
                    />
                ))}
            </Box>
            <Button disabled={uploading} onClick={submit}>
                <DocumentUpload />
            </Button>
        </Box>
    );
};
