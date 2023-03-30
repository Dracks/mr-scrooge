import { Injectable, Logger, Inject } from '@nestjs/common';
import { MigrationsService, KNEX_INSTANCE } from '@knestjs/core'
import {Knex} from 'knex';
import { Command } from 'nestjs-command';

@Injectable()
export class MigrationsCommand {
    private logger = new Logger('MigrationsCommand');

    constructor(private readonly migrationService: MigrationsService, @Inject(KNEX_INSTANCE) private readonly knexjs: Knex) {}

    // eslint-disable-next-line max-lines-per-function
    @Command({
        command: 'makemigrations',
    })
    async makeMigrations( ) {
        await this.migrationService.makeMigrations()
    }

    @Command({
        command: 'migrate',
    })
    async migrate( ) {
        await this.knexjs.migrate.latest()
    }
}
