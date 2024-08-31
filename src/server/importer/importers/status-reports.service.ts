import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';

import { CursorHandler, ListWithCursor } from '../../common/cursor-handler';
import { queryOwnerId } from '../../session/db-query';
import { IStatusReport, StatusReport } from '../models/status-report';
import { StatusReportRow } from '../models/status-report-row-import';
import sequelize from 'sequelize';

@Injectable()
export class StatusReportsService {
    private readonly cursorHandler = new CursorHandler<StatusReport, 'id'>(['id']);

    constructor(
        @InjectModel(StatusReport) private readonly statusReportModel: typeof StatusReport,
        @InjectModel(StatusReportRow) private readonly statusReportRowModel: typeof StatusReportRow,
    ) {}

    async getAll(groupIds: number[], cursor?: string, limit = 100): Promise<ListWithCursor<IStatusReport>> {
        const andConditional: WhereOptions<StatusReport>[] = [queryOwnerId(groupIds)];

        if (cursor) {
            const cursorData = this.cursorHandler.parse(cursor);
            andConditional.push({ id: { [Op.lt]: cursorData.id } });
        }

        const list = (
            await this.statusReportModel.findAll({
                where: sequelize.and(...andConditional),
                limit,
                order: [['id', 'desc']],
            })
        ).map(report => report.dataValues);

        const lastElement = list.length >= limit ? list[list.length - 1] : undefined;

        return {
            list,
            next: lastElement ? this.cursorHandler.stringify(lastElement) : undefined,
        };
    }
}
