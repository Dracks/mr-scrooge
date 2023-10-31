import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ConditionModel } from './models/condition.model';
import { RuleModel } from './models/rule.model';

@Module({
    imports: [SequelizeModule.forFeature([RuleModel, ConditionModel])],
    providers: [],
})
export class RulesModule {}
