import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import sequelize, { Op } from "sequelize";
import { WhereOptions } from "sequelize";
import { CursorHandler, ListWithCursor } from "../common/cursor-handler";
import { BankMovement } from "./models/bank-movement.model";

@Injectable()
export class BankMovementService {
    private readonly logger = new Logger(BankMovementService.name)

    private readonly cursorHandler = new CursorHandler<BankMovement, 'date' | 'id'>(["date", 'id'])

    constructor(@InjectModel(BankMovement) private readonly bankMovementModel: typeof BankMovement){}
    
    async getAll(cursor?: string, pageSize= 100, query?: {}): Promise<ListWithCursor<BankMovement>> {
        const orConditionals = [];
        if (cursor) {
            const cursorData = this.cursorHandler.parse(cursor)
            orConditionals.push(
                    {
                date: cursorData.date,
                id: {
                    [Op.lt]: cursorData.id
                },
            })
            orConditionals.push({
                date: {
                    [Op.lt]: cursorData.date
                }
            })
        }
        const where : WhereOptions<BankMovement>= sequelize.or(...orConditionals)

        const listData = await this.bankMovementModel.findAll({where, limit: pageSize, order: [[`date`, `desc`],['id', 'desc']]})
        return {
            list: listData,
            cursor: this.cursorHandler.stringify(listData[listData.length-1])
        }
    }
}