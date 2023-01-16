import { MikroORM } from '@mikro-orm/core'
import {Module, Logger} from '@nestjs/common'

import {MikroOrmModule} from '@mikro-orm/nestjs'

const logger = new Logger('MikroORM')

@Module({
	imports: [
		MikroOrmModule.forRoot({
			type: 'sqlite',
			dbName: ':memory:',
			autoLoadEntities: true,
			allowGlobalContext: true,
			migrations: {
			    path: 'build/migrations/sqlite',
			    pathTs: 'src/migrations/sqlite',
			},
			logger: (msg: string) => logger.log(msg) 
		})
		]
})
export class TestDbModule {
	constructor(readonly orm: MikroORM){}

	async onModuleInit(){
		const migrator = this.orm.getMigrator()
		await migrator.createMigration();
		await migrator.up()
	}

}
