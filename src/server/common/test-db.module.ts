import { ObjectionModule } from "@willsoto/nestjs-objection";
import { Logger, Module } from '@nestjs/common';

const logger = new Logger('MikroORM');

@Module({
    imports: [
        ObjectionModule.register({
            config: {
                client: "sqlite3",
                useNullAsDefault: true,
                connection: {
                  filename: ":memory:",
                },
            }
        }),
    ],
})
export class TestDbModule {
    /*constructor(readonly orm: MikroORM) {}

    async onModuleInit() {
        const migrator = this.orm.getMigrator();
        await migrator.createMigration();
        await migrator.up();
    }*/
}