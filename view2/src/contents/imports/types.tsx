export enum FileStatus {
    load='load',
    upload='upload',
    uploading='uploading',
    error='error'
}

export interface IFileData {
    id: number
    kind: string
    file: File
    status: FileStatus
}