import hash from 'object-hash';
import { IndexesOptions } from 'sequelize';

import { MigratorIndex, MigratorIndexOptions } from './types';

export const parseIndex = (idx: IndexesOptions) => {
    /*
     * FIXME the ts.ignore
     */
    // @ts-ignore
    if (idx.type == '') delete idx.type;
    const options: MigratorIndexOptions = {};

    if (idx.name) options.name = options.indexName = idx.name; // The name of the index. Default is __

    // @todo: UNIQUE|FULLTEXT|SPATIAL
    if (idx.unique) options.type = options.indicesType = 'UNIQUE';

    /*
     * FIXME Is it really necessary?
     * if (idx.method) options.indexType = idx.type; // Set a type for the index, e.g. BTREE. See the documentation of the used dialect
     */

    if (idx.parser && idx.parser != '') options.parser = idx.parser; // For FULLTEXT columns set your parser

    const hashValue = hash(options);

    //    log ('PI:', JSON.stringify(idx, null, 4));
    return {
        hash: hashValue,
        idx: {
            options,
            fields: idx.fields,
        },
    };
};
