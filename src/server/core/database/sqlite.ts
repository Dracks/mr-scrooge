import {SqliteConfig} from '@knestjs/core'

export const getSqlite = (): SqliteConfig => ({
    client: 'sqlite3',
    connection: {
        filename: './db.sqlite3',
    },
    useNullAsDefault: true,
});
