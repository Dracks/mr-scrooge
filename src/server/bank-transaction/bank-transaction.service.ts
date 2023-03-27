import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { InferCreationAttributes, Op, WhereOptions } from 'sequelize';

import { CursorHandler, ListWithCursor } from '../common/cursor-handler';
import { queryOwnerId } from '../session/db-query';
import { BankTransaction, IBankTransaction } from './models/bank-transaction.model';

@Injectable()
export class BankTransactionService {
    private readonly logger = new Logger(BankTransactionService.name);

    private readonly cursorHandler = new CursorHandler<BankTransaction, 'date' | 'id'>(['date', 'id']);

    constructor(@InjectModel(BankTransaction) private readonly bankMovementModel: typeof BankTransaction) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getAll(groupIds: number[], cursor?: string, limit = 100, query= {}): Promise<ListWithCursor<IBankTransaction>> {
        const andConditional: WhereOptions<BankTransaction>[] = [queryOwnerId(groupIds)];

        if (cursor) {
            const orConditionals = [];
            const cursorData = this.cursorHandler.parse(cursor);
            orConditionals.push({
                date: cursorData.date,
                id: {
                    [Op.lt]: cursorData.id,
                },
            });
            orConditionals.push({
                date: {
                    [Op.lt]: cursorData.date,
                },
            });
            andConditional.push(sequelize.or(...orConditionals));
        }
        const where: WhereOptions<BankTransaction> | undefined =
            andConditional.length > 0 ? sequelize.and(...andConditional) : undefined;

        const listData = await this.bankMovementModel.findAll({
            where,
            limit,
            order: [
                [`date`, `desc`],
                ['id', 'desc'],
            ],
        });
        const cursorElement = listData.length >= limit ? listData[listData.length - 1].dataValues : undefined;

        return {
            list: listData.map(movement => movement.dataValues),
            next: cursorElement ? this.cursorHandler.stringify(cursorElement) : undefined,
        };
    }

    async insertBatch(movements: InferCreationAttributes<BankTransaction>[]) {
        await this.bankMovementModel.bulkCreate(movements, {
            logging: (sql, timing) => {
                // this.logger.log({sql, timing}, 'Bulk insert')
                this.logger.log({sql, timing}, 'Insert batch');
            },
            validate: true,
        });
    }

    async addTransaction(transaction: Omit<InferCreationAttributes<BankTransaction>, 'id'>) {
        const data = await this.bankMovementModel.create(transaction);
        return data.dataValues;
    }
}