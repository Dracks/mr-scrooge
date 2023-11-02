import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreationAttributes, InferAttributes, Sequelize } from "sequelize";

import { queryOwnerId } from "../session/db-query";
import { ConditionModel } from "./models/condition.model";
import { RuleModel } from "./models/rule.model";

interface NewRule extends Omit<CreationAttributes<RuleModel>, 'conditions'> {
    conditions: Omit<CreationAttributes<ConditionModel>, 'rule'>[]
}

interface Rule extends Omit<InferAttributes<RuleModel>, 'conditions'> {
    conditions: Omit<InferAttributes<ConditionModel>, 'rule'>[]
}

@Injectable()
export class RuleService {

    readonly logger = new Logger();

    constructor(
        // private readonly sequelize: Sequelize,
        @InjectModel(RuleModel) private readonly ruleModel: typeof RuleModel,
        @InjectModel(ConditionModel) private readonly conditionModel: typeof ConditionModel,
    ){}

    async createRule({conditions, ...rule}: NewRule){
        const ruleObj = await this.ruleModel.create(rule);
        const ruleId = ruleObj.dataValues.id
        await Promise.all(conditions.map(condition => (
            this.conditionModel.create({
                ...condition,
                rule: ruleId
            })
        )))
    }

    async getRules(groupsId: number[]): Promise<Rule[]> {
        const rulesList = (await this.ruleModel.findAll({
            where: queryOwnerId(groupsId),
            include: [ConditionModel]
        })).map(rule => ({
            ...rule.dataValues,
            conditions: rule.dataValues.conditions ?? []
        }));
        this.logger.log(rulesList, "something!")
        return rulesList
    }
}