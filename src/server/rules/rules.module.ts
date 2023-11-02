import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ConditionModel } from './models/condition.model';
import { RuleModel } from './models/rule.model';
import { RuleResolver } from './resolvers/rules.resolver';
import { RuleService } from './rule.service';

@Module({
    imports: [SequelizeModule.forFeature([RuleModel, ConditionModel])],
    providers: [RuleService, RuleResolver],
    exports: [RuleService],
})
export class RulesModule {}
