export type PRIMARY_KEY = number

export interface ITag {
    id: PRIMARY_KEY
    name: string
}

export interface IRawData {
    id: PRIMARY_KEY,
    kind: string,
    tags: PRIMARY_KEY[],
    movement_name: string,
    value: number,
    date: Date,
}

export interface IProfileData {
    username: string,
    email: string
}

export interface IFileKind {
    key: string,
    regexp: RegExp
}
