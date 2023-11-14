import * as Sequelize from 'sequelize';
import { Model, ModelAttributeColumnOptions,ModelStatic } from 'sequelize/types/model';
import { Sequelize as TSequelize } from 'sequelize-typescript';

import { parseIndex } from './parse-index';
import { reverseSequelizeColType } from './reverse-seq-col-type';
import { reverseSequelizeDefValueType } from './reverse-sequelize-def-value-type';
import { MigratorAttribute, MigratorIndex, TablesMap } from './types';

const {log} = console;

export const reverseModels = (sequelize: TSequelize, models: Record<string, ModelStatic<Model>>): TablesMap => {
    const tables: TablesMap = {};

    delete models.default;

    for (const modelIdx in models) {
        const model = models[modelIdx];
        const attributes = model.getAttributes();
        const migAttributes: Record<string, MigratorAttribute> = {};

        for (const columnIdx in attributes) {
            /*
             *delete attributes[column].Model;
             *delete attributes[column].fieldName;
             *delete attributes[column].kishiOptions;
             *delete attributes[column].validate;
             * // delete attributes[column].field;
             *
             */
            const column = attributes[columnIdx] as ModelAttributeColumnOptions & { seqType: string };
            const attrib: Partial<MigratorAttribute> = {
                field: column.field,
                autoIncrement: column.autoIncrement,
                primaryKey: column.primaryKey,
                allowNull: column.allowNull,
            };

            migAttributes[columnIdx] = attrib as MigratorAttribute;
            const defaultValue = reverseSequelizeDefValueType(column.defaultValue);
            if (defaultValue && 'notSupported' in defaultValue && defaultValue.notSupported) {
                log(`[Not supported] Skip defaultValue column of attribute ${modelIdx}:${columnIdx}`);
            } else {
                attrib.defaultValue = defaultValue;
            }

            if (typeof column.type === 'undefined') {
                if (!column.seqType) {
                    log(`[Not supported] Skip column with undefined type ${modelIdx}:${columnIdx}`);
                    continue;
                } else {
                    if (
                        !['Sequelize.ARRAY(Sequelize.INTEGER)', 'Sequelize.ARRAY(Sequelize.STRING)'].includes(
                            column.seqType,
                        )
                    ) {
                        continue;
                    }
                    attrib.type = {
                        key: Sequelize.ARRAY.key,
                    };
                }
            } else {
                attrib.type = column.type;
            }

            let seqType = reverseSequelizeColType(column);

            // NO virtual types in migration
            if (seqType === 'Sequelize.VIRTUAL') {
                log(`[SKIP] Skip Sequelize.VIRTUAL column "${columnIdx}"", defined in model "${modelIdx}"`);
                continue;
            }

            if (!seqType) {
                // FIXME again some weird cast here
                const columnTypeOptions = (
                    column.type as unknown as { options: { toString: (s: TSequelize) => string } }
                ).options;
                if (typeof columnTypeOptions !== 'undefined' && typeof columnTypeOptions.toString === 'function')
                    seqType = columnTypeOptions.toString(sequelize);

                if (typeof column.type.toString === 'function') seqType = column.type.toString(sequelize);
            }

            attrib.seqType = seqType;
            if (column.references) {
                attrib.references = column.references;
            }
        }

        tables[model.tableName] = {
            tableName: models[modelIdx].tableName,
            schema: migAttributes,
            indexes: {},
        };

        if ((model.options.indexes ?? []).length > 0) {
            const idx_out: Record<string, MigratorIndex> = {};
            model.options.indexes?.forEach(index => {
                const { hash, idx } = parseIndex(index);
                // make it immutable
                Object.freeze(index);
                idx_out[hash] = idx;
            });

            tables[model.tableName].indexes = idx_out;
        }

        if (typeof model.options.charset !== 'undefined') {
            tables[model.tableName].charset = model.options.charset;
        }
    }

    return tables;
};
