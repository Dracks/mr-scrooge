import { SequelizeModule } from '@nestjs/sequelize';

export const TestDbModule = SequelizeModule.forRoot({
    autoLoadModels: true,
    dialect: 'sqlite',
    logging: false,
    repositoryMode: true,
    synchronize: true,
});
