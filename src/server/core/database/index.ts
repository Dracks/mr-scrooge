import { KnestModuleConfig } from '@knestjs/core'

import { getSqlite } from './sqlite';

export const getDatabaseModule = (): KnestModuleConfig['db'] => getSqlite();
