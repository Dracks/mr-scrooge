
import { Injectable, Inject } from "@nestjs/common";
import { Command, Option } from "nestjs-command";
import { InjectConnection } from '@nestjs/sequelize'
import { Sequelize } from 'sequelize-typescript';
import { generateMigration } from 'sequelize-typescript-model-migration'
import path from 'path';

@Injectable()
export class MigrationsCommand {
	constructor(@InjectConnection()
    
    private readonly sequelize: Sequelize,){}

	@Command({
		command: 'makemigrations'
	})
	async createMigrations(){
		await generateMigration(this.sequelize, {
		    outDir: path.join(__dirname, "../../migrations"),
		    snapshotDir: path.join(__dirname, "../../snapshots"),
		    migrationName: "my-migration-file",
		});
	}
}