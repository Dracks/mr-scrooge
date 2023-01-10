import {SequelizeOptions} from 'sequelize-typescript';

import { getSqlite } from './sqlite';

export const getDatabaseModule = (): Partial<SequelizeOptions>=>getSqlite()