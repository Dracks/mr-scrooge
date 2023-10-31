import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import fs from 'fs';
import { Command, Option } from 'nestjs-command';
import path from 'path';
import * as migrate from 'sequelize-auto-migrations-vk/lib/migrate';
import { Sequelize } from 'sequelize-typescript';

import { CliConfig } from './config/cli-config';

interface migrationState {
    revision: number;
    tables: Record<string, unknown>;
    version: number;
}

@Injectable()
export class MigrationsCommand {
    private logger = new Logger('MigrationsCommand');

    constructor(@InjectConnection() private readonly sequelize: Sequelize, private readonly config: CliConfig) {}

    // eslint-disable-next-line max-lines-per-function
    @Command({
        command: 'makemigrations',
    })
    makeMigrations(
        @Option({ name: 'preview', default: false, type: 'boolean' }) preview: boolean,
        @Option({ name: 'name', default: 'no-name' }) name: string,
    ) {
        const { sequelize, config } = this;
        const migrationsDir = config.migrationsFolder;
        if (!fs.existsSync(migrationsDir)) {
            throw new Error(`Migrations folder ${migrationsDir} doesn't exists`);
        }

        // current state
        const currentState: migrationState = {
            tables: {},
            revision: 0,
            version: 0,
        };

        // load last state
        let previousState: migrationState = {
            revision: 0,
            version: 1,
            tables: {},
        };

        try {
            previousState = JSON.parse(fs.readFileSync(path.join(migrationsDir, '_current.json')).toString());
            // eslint-disable-next-line id-length, no-empty
        } catch (e) {}

        const { models } = sequelize;

        currentState.tables = migrate.reverseModels(sequelize, models);
        const actions = migrate.parseDifference(previousState.tables, currentState.tables);
        // sort actions
        migrate.sortActions(actions);
        const migration = migrate.getMigration(actions);
        if (migration.commandsUp.length === 0) {
            this.logger.log('No changes found');
            process.exit(0);
        }

        /*
         * log migration actions
         * _.each(migration.consoleOut, (v) => { console.log("[Actions] " + v) });
         */
        if (preview) {
            migration.commandsUp.forEach(commandStr => {
                // const command : migrate.MigrationCmd = eval(commandStr)
                this.logger.log(commandStr, 'Migration:');
            });
            process.exit(0);
        }

        // backup _current file
        if (fs.existsSync(path.join(migrationsDir, '_current.json')))
            fs.writeFileSync(
                path.join(migrationsDir, '_current_bak.json'),
                fs.readFileSync(path.join(migrationsDir, '_current.json')),
            );

        // save current state
        currentState.revision = previousState.revision + 1;
        fs.writeFileSync(path.join(migrationsDir, '_current.json'), JSON.stringify(currentState, null, 4));

        // write migration to file
        const info = migrate.writeMigration(Date.now(), migration, migrationsDir, name, '');

        this.logger.log(`New migration to revision ${currentState.revision} has been saved to file '${info.filename}'`);
    }
}
