import { SequelizeModule } from '@nestjs/sequelize';

export const TestDbModule = SequelizeModule.forRoot({
	dialect: 'sqlite',
	autoLoadModels: true,
	synchronize: true,
	logging: false
})