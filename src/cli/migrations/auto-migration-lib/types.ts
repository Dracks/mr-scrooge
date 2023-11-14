import { DataType, IndexesOptions, TableName } from 'sequelize';
import {
    Model,
    ModelAttributeColumnOptions,
    ModelAttributeColumnReferencesOptions,
    ModelStatic,
} from 'sequelize/types/model';
import { Sequelize as TSequelize } from 'sequelize-typescript';

export interface InternalDefault {
    internal: true;
    value: string;
}

export interface NotSupportedDefault {
    notSupported: true;
    value: '';
}

export interface DefaultValue {
    value: unknown;
}

export interface MigratorAttribute {
    allowNull?: boolean;
    autoIncrement?: boolean;
    defaultValue: InternalDefault | DefaultValue;
    field: string;
    primaryKey?: boolean;
    references?: string | ModelAttributeColumnReferencesOptions;
    seqType: string;
    type: DataType | { key: unknown };
}

export interface MigratorIndexOptions {
    indexName?: string;
    indexType?: string;
    indicesType?: string;
    // unknowns
    name?: string;
    parser?: string;
    type?: string;
}

export interface MigratorIndex {
    fields: IndexesOptions['fields'];
    options: MigratorIndexOptions;
}

export interface TableDefinition {
    charset?: string;
    indexes: Record<string, MigratorIndex>;
    schema: Record<string, MigratorAttribute>;
    tableName: string;
}

export type ActionType =
    | 'removeIndex'
    | 'removeColumn'
    | 'dropTable'
    | 'createTable'
    | 'addColumn'
    | 'changeColumn'
    | 'addIndex';

export interface ActionOptions {
    charset: string;
    indexes: [];
}

export interface Action {
    actionType: ActionType;
    attributeName?: string;
    attributes?: Record<string, MigratorAttribute>;
    // FIXME columnName and attributeName ashould be the same
    columnName?: string;
    depends: TableName[];
    // FIXME fields and attributes?¿
    fields?: unknown[];
    options?: ActionOptions | MigratorAttribute | MigratorIndexOptions;
    tableName: TableName;
}

export type TablesMap = Record<string, TableDefinition>;

export interface Migration {
    commandsUp: string[];
    consoleOut: string[];
}
