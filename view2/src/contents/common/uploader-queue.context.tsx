import React from 'react';

import { usePostUploadFile } from '../../api/client/imports/use-post-upload-file';
import { EventTypes, useEventEmitter } from '../../utils/providers/event-emitter.provider';
import { FileStatus, IFileData } from '../imports/types';

export interface UploadQueueType {
    files: IFileData[];
    onAdd: (newFiles: Array<Omit<IFileData, 'status' | 'id'>>) => void;
    onChangeKind: (fileId: number, kind: string) => void;
    submit: () => void;
    uploading: boolean;
}

const UploadQueueContext = React.createContext<UploadQueueType>({
    files: [],
    onAdd: () => undefined,
    onChangeKind: () => undefined,
    submit: () => undefined,
    uploading: false,
});

export const useUploadQueue = () => React.useContext(UploadQueueContext);

export const ProvideUploadQueue: React.FC = ({ children }) => {
    const { sendFile } = usePostUploadFile();
    const eventEmitter = useEventEmitter();
    const [counter, setCounter] = React.useState<number>(0);
    const [files, setFiles] = React.useState<Array<IFileData>>([]);
    const [uploading, setUploading] = React.useState(false);

    const change = (fileId: number, change: Partial<IFileData>) => {
        const pos = files.findIndex(({ id }) => fileId === id);
        if (pos >= 0) {
            files[pos] = { ...files[pos], ...change };
            setFiles([...files]);
        }
    };

    const context: UploadQueueType = {
        files,
        onAdd: newFiles => {
            if (uploading) {
                throw new Error('You cannot add files while uploading others');
            }

            const newObjFiles = newFiles.map((fileData, idx) => ({
                ...fileData,
                status: FileStatus.load,
                id: idx + counter,
            }));
            setCounter(counter + newObjFiles.length);
            setFiles([...files.filter(({ status }) => status === FileStatus.load), ...newObjFiles]);
        },
        onChangeKind: (fileId, kind) => {
            change(fileId, { kind });
        },
        submit: async () => {
            setUploading(true);
            for await (const fileData of files) {
                change(fileData.id, { status: FileStatus.uploading });
                const response = await sendFile(fileData.kind, fileData.file);

                if (response.status === 200) {
                    change(fileData.id, { status: FileStatus.upload });
                    eventEmitter.emit(EventTypes.OnFileUploaded);
                } else {
                    change(fileData.id, { status: FileStatus.error });
                }
            }
            setUploading(false);
            eventEmitter.emit(EventTypes.OnQueueUploadFinish);
        },
        uploading,
    };

    return <UploadQueueContext.Provider value={context}>{children}</UploadQueueContext.Provider>;
};
