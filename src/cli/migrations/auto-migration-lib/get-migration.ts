import { Action, Migration, MigratorAttribute } from './types';

const propertyToStr = (obj: MigratorAttribute) => {
    const vals: string[] = [];
    if (obj.seqType) {
        vals.push(`"type": ${  obj.seqType}`);
    } else {
        vals.push(`"type": ${  JSON.stringify(obj.type)}`);
    }

    vals.push(`"field":${  JSON.stringify(obj.field)}`);

    if (obj.defaultValue) {
        const { defaultValue } = obj;
        if ('internal' in defaultValue && defaultValue.internal) {
            vals.push(`"defaultValue": ${  defaultValue.value}`);
        } else if (defaultValue.value) {
            vals.push(`"defaultValue": ${  JSON.stringify(defaultValue.value)}`);
        }
    }
    /*
     *Compact the rest of fields in the obj?¿
     *
     *let x = {};
     *x[k] = obj[k];
     *vals.push(JSON.stringify(x).slice(1, -1));
     */
    if (obj.primaryKey) {
        vals.push(`"primaryKey": ${  JSON.stringify(obj.primaryKey)}`);
    }
    if (typeof obj.allowNull !== 'undefined') {
        vals.push(`"allowNull": ${  JSON.stringify(obj.allowNull)}`);
    }
    if (obj.autoIncrement) {
        vals.push(`"autoIncrement": ${  JSON.stringify(obj.autoIncrement)}`);
    }
    if (obj.references) {
        vals.push(`"references": ${  JSON.stringify(obj.references)}`);
    }

    return `{ ${  vals.reverse().join(', ')  } }`;
};

const getAttributes = (attrs: Record<string, MigratorAttribute>) => {
    const ret = [];
    for (const attrName in attrs) {
        ret.push(`      "${attrName}": ${propertyToStr(attrs[attrName])}`);
    }
    return ` { \n${  ret.join(', \n')  }\n     }`;
};

export const getMigration = (actions: Action[]): Migration => {
    

    const commandsUp: string[] = [];
    const consoleOut: string[] = [];

    actions.forEach(action => {
        switch (action.actionType) {
            case 'createTable':
                {
                    const resUp = `{ fn: "createTable", params: [
    "${action.tableName}",
    ${getAttributes(action.attributes ?? {})},
    ${JSON.stringify(action.options)}
] }`;
                    commandsUp.push(resUp);

                    consoleOut.push(`createTable "${action.tableName}", deps: [${action.depends.join(', ')}]`);
                }
                break;

            case 'dropTable':
                {
                    const res = `{ fn: "dropTable", params: ["${action.tableName}"] }`;
                    commandsUp.push(res);

                    consoleOut.push(`dropTable "${action.tableName}"`);
                }
                break;

            case 'addColumn':
                {
                    const resUp = `{ fn: "addColumn", params: [
    "${action.tableName}",
    "${
        action.options && 'field' in action.options && action.options.field
            ? action.options.field
            : action.attributeName
    }",
    ${propertyToStr(action.options as MigratorAttribute)}
] }`;

                    commandsUp.push(resUp);

                    consoleOut.push(`addColumn "${action.attributeName}" to table "${action.tableName}"`);
                }
                break;

            case 'removeColumn':
                {
                    const res = `{ fn: "removeColumn", params: ["${action.tableName}", "${
                        action.options && 'field' in action.options && action.options.field
                            ? action.options.field
                            : action.columnName
                    }"] }`;
                    commandsUp.push(res);

                    consoleOut.push(
                        `removeColumn "${
                            action.options && 'field' in action.options && action.options.field
                                ? action.options.field
                                : action.columnName
                        }" from table "${action.tableName}"`,
                    );
                }
                break;

            case 'changeColumn':
                {
                    const res = `{ fn: "changeColumn", params: [
    "${action.tableName}",
    "${
        action.options && 'field' in action.options && action.options.field
            ? action.options.field
            : action.attributeName
    }",
    ${propertyToStr(action.options as MigratorAttribute)}
] }`;
                    commandsUp.push(res);

                    consoleOut.push(`changeColumn "${action.attributeName}" on table "${action.tableName}"`);
                }
                break;

            case 'addIndex':
                {
                    const res = `{ fn: "addIndex", params: [
    "${action.tableName}",
    ${JSON.stringify(action.fields)},
    ${JSON.stringify(action.options)}
] }`;
                    commandsUp.push(res);

                    const nameOrAttrs =
                        action.options &&
                        'indexName' in action.options &&
                        action.options.indexName &&
                        action.options.indexName != ''
                            ? `"${action.options.indexName}"`
                            : JSON.stringify(action.fields);
                    consoleOut.push(`addIndex ${nameOrAttrs} to table "${action.tableName}"`);
                }
                break;

            case 'removeIndex': {
                //                log(action)
                const nameOrAttrs =
                    action.options &&
                    'indexName' in action.options &&
                    action.options.indexName &&
                    action.options.indexName != ''
                        ? `"${action.options.indexName}"`
                        : JSON.stringify(action.fields);

                const res = `{ fn: "removeIndex", params: [
    "${action.tableName}",
    ${nameOrAttrs}
] }`;
                commandsUp.push(res);

                consoleOut.push(`removeIndex ${nameOrAttrs} from table "${action.tableName}"`);
            }

            default:
            // code
        }
    });

    return { commandsUp, consoleOut };
};
