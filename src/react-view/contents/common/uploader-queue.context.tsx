import React, { PropsWithChildren } from 'react';

import { usePostUploadFile } from '../../api/upload-file'
import { EventTypes, useEventEmitter } from '../../utils/providers/event-emitter.provider';
import { FileStatus, IFileData } from '../imports/types';

export interface UploadQueueType {
    files: IFileData[];
    onAdd: (newFiles: Array<Omit<IFileData, 'status' | 'id'>>) => void;
    onChangeKind: (fileId: number, kind: string) => void;
    onRemove: (fileId: number) => void;
    submit: () => void;
    uploading: boolean;
}

const UploadQueueContext = React.createContext<UploadQueueType>({
    files: [],
    onAdd: () => undefined,
    onChangeKind: () => undefined,
    onRemove: () => undefined,
    submit: () => undefined,
    uploading: false,
});

export const useUploadQueue = () => React.useContext(UploadQueueContext);

export const ProvideUploadQueue: React.FC<PropsWithChildren> = ({ children }) => {
    //const client = useApi()
    //const sendFile = useAsyncCallback((body: components['schemas']['UploadDataMultiPart']) => client.POST("/imports", { body }))
    // const { sendFile } = usePostUploadFile();
    const sendFile = usePostUploadFile();
    const eventEmitter = useEventEmitter();
    const [counter, setCounter] = React.useState<number>(0);
    const [files, setFiles] = React.useState<IFileData[]>([]);
    const [uploading, setUploading] = React.useState(false);

    const change = (fileId: number, changeFile: Partial<IFileData>) => {
        setFiles(oldFiles => {
            const pos = oldFiles.findIndex(({ id }) => fileId === id);
            if (pos >= 0) {
                oldFiles[pos] = { ...oldFiles[pos], ...changeFile };
            }
            return [...oldFiles];
        });
    };

    const submit = async () => {
        setUploading(true);
        for await (const fileData of files) {
            change(fileData.id, { status: FileStatus.uploading });
            const response = await sendFile.execute(fileData.kind, fileData.file);

            if (response.status === 200) {
                change(fileData.id, { status: FileStatus.upload });
                eventEmitter.emit(EventTypes.OnFileUploaded);
            } else {
                change(fileData.id, { status: FileStatus.error });
            }
        }
        setUploading(false);
        eventEmitter.emit(EventTypes.OnQueueUploadFinish);
    }

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
            setFiles(oldFiles => [...oldFiles.filter(({ status }) => status === FileStatus.load), ...newObjFiles]);
        },
        onChangeKind: (fileId, kind) => {
            change(fileId, { kind });
        },
        onRemove: fileId => {
            setFiles(oldFiles => [...oldFiles.filter(({ id }) => fileId !== id)]);
        },
        submit: ()=>{
            submit().catch(()=>undefined)
        },
        uploading,
    };

    return <UploadQueueContext.Provider value={context}>{children}</UploadQueueContext.Provider>;
};
