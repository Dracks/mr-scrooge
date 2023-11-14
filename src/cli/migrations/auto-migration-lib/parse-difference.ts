import { diff } from 'deep-diff';
import * as _ from 'lodash';
import { TableName } from 'sequelize';
import { ModelAttributeColumnOptions, ModelAttributeColumnReferencesOptions } from 'sequelize/types/model';

import {
    Action,
    ActionOptions,
    ActionType,
    MigratorAttribute,
    MigratorIndex,
    TableDefinition,
    TablesMap,
} from './types';

const {log} = console;

export const parseDifference = function (previousState: TablesMap, currentState: TablesMap) {
    //    log(JSON.stringify(currentState, null, 4));
    const actions: Action[] = [];
    const difference = diff(previousState, currentState) ?? [];


    difference.filter(df => {
      // @ts-ignore
      return df.rhs !== undefined || df.lhs !== undefined
    }).forEach(df => {
        // log(JSON.stringify(df, null, 4));
        const path = df.path ?? [];
        switch (df.kind) {
            // add new
            case 'N':
                {
                    // new table created
                    if (path.length === 1) {
                        const rhs = df.rhs as unknown as TableDefinition;
                        const depends: TableName[] = [];
                        const {tableName} = rhs;
                        Object.entries(df.rhs.schema).forEach(entry => {
                            const v = entry[1] as ModelAttributeColumnOptions;
                            if (v.references)
                                depends.push(
                                    (v.references as ModelAttributeColumnReferencesOptions).model as TableName,
                                );
                        });

                        const options: Partial<ActionOptions> = {};
                        if (typeof df.rhs.charset !== 'undefined') {
                            options.charset = df.rhs.charset as unknown as string;
                        }

                        actions.push({
                            actionType: 'createTable',
                            tableName,
                            attributes: rhs.schema,
                            options: options as ActionOptions,
                            depends,
                        });

                        // create indexes
                        if (rhs.indexes)
                            for (const _i in rhs.indexes) {
                                actions.push(
                                    _.extend(
                                        {
                                            actionType: 'addIndex' as ActionType,
                                            tableName,
                                            depends: [tableName],
                                        },
                                        _.clone(rhs.indexes[_i]),
                                    ),
                                );
                            }
                        break;
                    }

                    const tableName = path[0];
                    const depends = [tableName];

                    if (path[1] === 'schema') {
                        // if (df.path.length === 3) - new field
                        if (path.length === 3) {
                            const rhs = df.rhs as unknown as MigratorAttribute;
                            // new field
                            if (rhs && rhs.references) {
                                if (typeof rhs.references === 'object') {
                                    depends.push(rhs.references.model);
                                } else {
                                    depends.push(rhs.references);
                                }
                            }

                            actions.push({
                                actionType: 'addColumn',
                                tableName,
                                attributeName: path[2],
                                options: rhs,
                                depends,
                            });
                            break;
                        }

                        // if (df.path.length > 3) - add new attribute to column (change col)
                        if (path.length > 3) {
                            console.log(df)
                            if (path[1] === 'schema') {
                                // new field attributes
                                const options = currentState[tableName].schema[path[2]];
                                if (options.references) {
                                    if (typeof options.references === 'object') {
                                        depends.push(options.references.model);
                                    } else {
                                        depends.push(options.references);
                                    }
                                }

                                actions.push({
                                    actionType: 'changeColumn',
                                    tableName,
                                    attributeName: path[2],
                                    options,
                                    depends,
                                });
                                break;
                            }
                        }
                    }

                    // new index
                    if (path[1] === 'indexes') {
                        const tableName = path[0];
                        const index = _.clone(df.rhs as unknown as MigratorIndex) as unknown as Action;
                        if (!index) {
                            break;
                        }
                        index.actionType = 'addIndex';
                        index.tableName = tableName;
                        index.depends = [tableName];
                        actions.push(index);
                        break;
                    }
                }
                break;

            // drop
            case 'D':
                {
                    const tableName = path[0];
                    const depends = [tableName];

                    if (path.length === 1) {
                        // drop table
                        actions.push({
                            actionType: 'dropTable',
                            tableName,
                            depends: [],
                        });
                        break;
                    }

                    if (path[1] === 'schema') {
                        // if (df.path.length === 3) - drop field
                        if (path.length === 3) {
                            // drop column
                            actions.push({
                                actionType: 'removeColumn',
                                tableName,
                                columnName: path[2],
                                depends: [tableName],
                                options: df.lhs as unknown as MigratorAttribute,
                            });
                            break;
                        }

                        // if (df.path.length > 3) - drop attribute from column (change col)
                        if (path.length > 3) {
                            // new field attributes
                            const options = currentState[tableName].schema[path[2]];
                            if (options.references) {
                                if (typeof options.references === 'object') {
                                    depends.push(options.references.model);
                                } else {
                                    depends.push(options.references);
                                }
                            }

                            actions.push({
                                actionType: 'changeColumn',
                                tableName,
                                attributeName: path[2],
                                options,
                                depends,
                            });
                            break;
                        }
                    }

                    if (path[1] === 'indexes') {
                        //                    log(df)
                        const lhs = df.lhs as unknown as MigratorIndex;
                        actions.push({
                            actionType: 'removeIndex',
                            tableName,
                            fields: lhs.fields,
                            options: lhs.options,
                            depends: [tableName],
                        });
                        break;
                    }
                }
                break;

            // edit
            case 'E':
                {
                    const tableName = path[0];
                    const depends = [tableName];

                    if (path[1] === 'schema') {
                        console.log(df)
                        // new field attributes
                        const rhs = df.rhs as unknown as MigratorAttribute;
                        const options = currentState[tableName].schema[path[2]];
                        if (typeof rhs.references === 'object') {
                            depends.push(rhs.references.model);
                        } else {
                            depends.push(rhs.references);
                        }

                        actions.push({
                            actionType: 'changeColumn',
                            tableName,
                            attributeName: path[2],
                            options,
                            depends,
                        });
                    }

                    /*
                     * updated index
                     * only support updating and dropping indexes
                     */
                    if (path[1] === 'indexes') {
                        const rhs = df.rhs as unknown as Record<string, MigratorIndex>;
                        const lhs = df.lhs as unknown as Record<string, MigratorIndex>;
                        const tableName = path[0];
                        let keys = Object.keys(rhs);

                        for (const k in keys) {
                            const key = keys[k];
                            actions.push({
                                actionType: 'addIndex',
                                tableName,
                                fields: rhs[key].fields,
                                options: rhs[key].options,
                                depends: [tableName],
                            });
                            break;
                        }

                        keys = Object.keys(lhs);
                        for (const k in keys) {
                            const key = keys[k];
                            actions.push({
                                actionType: 'removeIndex',
                                tableName,
                                fields: lhs[key].fields,
                                options: lhs[key].options,
                                depends: [tableName],
                            });
                            break;
                        }
                    }
                }
                break;

            // array change indexes
            case 'A':
                {
                    log(
                        '[Not supported] Array model changes! Problems are possible. Please, check result more carefully!',
                    );
                    log('[Not supported] Difference: ');
                    log(JSON.stringify(df, null, 4));
                }
                break;

            default:
                // code
                break;
        }
    });
    return actions;
};
