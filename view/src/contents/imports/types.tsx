export enum FileStatus {
    error = 'error',
    load = 'load',
    upload = 'upload',
    uploading = 'uploading',
}

export interface IFileData {
    file: File;
    id: number;
    kind: string;
    status: FileStatus;
}
