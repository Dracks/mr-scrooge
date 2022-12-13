import { Module } from '@nestjs/common';
import {SequelizeModule } from '@nestjs/sequelize';

import { getDatabaseModule } from './database'

@Module({
	imports: [
		SequelizeModule.forRoot({
			...getDatabaseModule(),
			models: [],
      	autoLoadModels: true,
      	synchronize: true,

		})
	]
})
export class AppModule{}