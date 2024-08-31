export type FileParsedRow = Record<string | number, string | number> | Array<string | number>;

export interface FileParser {
    [Symbol.iterator]: () => Iterator<FileParsedRow>;
}

export class CsvParser {}

export type ImportStatus = 'OK' | 'WARN' | 'ERR';
