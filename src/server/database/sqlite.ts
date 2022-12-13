import {SequelizeOptions} from 'sequelize-typescript';

export const getSqlite = (): Partial<SequelizeOptions> =>({
      dialect: 'sqlite',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
})

