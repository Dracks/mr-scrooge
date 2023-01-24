
declare module 'sequelize-auto-migrations-vk/lib/migrate'{
    import { Sequelize } from 'sequelize-typescript';

    export interface WriteMigrationReturn {
        filename: string
        revision: number
    }
    export interface MigrationCmd {
        fn: string,
        params: unknown[],
    }

    export interface Migration {
        commandsUp: string[]
    }

    type TablesMap= Record<string, unknown>

    type Action= unknown

    export function reverseModels(s: Sequelize, models: Sequelize['models']):Record<string, unknown>;
    export function parseDifference(before: TablesMap, now: TablesMap):Action[];
    export function sortActions(actions: Action[]):Action[];
    export function getMigration(actions: Action[]):Migration;
    export function writeMigration(rev: number, migration: Migration, folder: string, name: string, comment: string):WriteMigrationReturn;
}