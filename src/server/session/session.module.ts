import {Module} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize'

import { UserModel } from './models/user.model';

@Module({
	imports: [SequelizeModule.forFeature([UserModel])],
})
export class SessionModule {}