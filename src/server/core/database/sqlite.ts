import {SequelizeOptions} from 'sequelize-typescript';

export const getSqlite = (): Partial<SequelizeOptions> =>({
      dialect: 'sqlite',
      storage: './db.sqlite3'
})

