import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { add, isBefore, isFuture, sub } from 'date-fns';
import { match, P } from 'ts-pattern';

import { BankTransactionService } from '../server/bank-transaction/bank-transaction.service';
import { DateOnly } from '../server/common/custom-types/date-only';
import { GraphGroup, GraphKind } from '../server/graphs/models/graph.model';
import { GraphService } from '../server/graphs/services/graph.service';
import { LabelService } from '../server/graphs/services/label.service';

interface Range {
    max: number;
    min: number;
}

@Injectable()
export class DemoDataService {
    constructor(
        private readonly transactionService: BankTransactionService,
        private readonly labelService: LabelService,
        private readonly graphService: GraphService,
    ) {}

    async generateTagAndTransactions(
        groupOwnerId: number,
        label: string,
        amountRange: Range,
        periodicity: 'days' | 'montly',
    ) {
        const labelData = await this.labelService.createLabel({ name: label, groupOwnerId });
        const nextFn = match(periodicity)
            .with('days', () => () => ({ days: Math.floor(Math.random() * 10 + 1) }))
            .with('montly', () => () => ({ months: 1, days: Math.floor(Math.random() * 2 - 1) }))
            .exhaustive();
        const getAmount = (() => {
            const { min, max } = amountRange;
            const diff = max - min;
            return () => Math.random() * diff + min;
        })();

        let date = match(periodicity)
            .with('days', () => sub(new Date(), nextFn()))
            .with('montly', () => {
                const d = new Date();
                d.setDate(5);
                return d;
            })
            .exhaustive();

        const finish = sub(new Date(), { months: 6 });
        finish.setDate(0);

        console.log(nextFn(), finish, date, sub(date, nextFn()));

        while (isBefore(finish, date)) {
            const transaction = await this.transactionService.addTransaction({
                date: new DateOnly(date).toString(),
                groupOwnerId,
                kind: 'demo',
                movementName: `transaction ${label}`,
                value: getAmount(),
                pageKey: '',
            });
            this.labelService.addTransaction({ labelId: labelData.dataValues.id, transactionId: transaction.id });
            date = sub(date, nextFn());
        } //* /
        return labelData.id;
    }

    async generateGraphs(groupOwnerId: number, labelIdMap: Record<string, number>) {
        await this.graphService.createGraph({
            groupOwnerId,
            name: 'Income vs expenses',
            kind: GraphKind.Bar,
            group: {
                group: GraphGroup.Sign,
            },
            horizontalGroup: {
                group: GraphGroup.Month,
            },
            dateRange: "half year",
        });
        await this.graphService.createGraph({
            groupOwnerId,
            name: 'Compare labels',
            kind: GraphKind.Line,
            group: {
                group: GraphGroup.Labels,
                labels: [labelIdMap.groceries, labelIdMap.gasoline],
            },
            horizontalGroup: {
                group: GraphGroup.Month,
            },
            dateRange: 'two years'
        });
    }

    async generateAll(groupOwnerId: number) {
        const labelConfigMap: Record<string, { amount: Range; periodicity: 'days' | 'montly' }> = {
            groceries: {
                amount: { max: -10, min: -100 },
                periodicity: 'days',
            },
            salary: {
                amount: { max: 2100, min: 1800 },
                periodicity: 'montly',
            },
            gasoline: { amount: { max: -30, min: -100 }, periodicity: 'days' },
            phone: {
                amount: { max: -10, min: -15 },
                periodicity: 'montly',
            },
            mortgage: {
                amount: { max: -400, min: -400 },
                periodicity: 'montly',
            },
        };
        const labelsList = (await Promise.all(
            Object.keys(labelConfigMap).map(async label => {
                const { amount, periodicity } = labelConfigMap[label] ?? {};
                if (amount && periodicity) {
                    const labelId = await this.generateTagAndTransactions(groupOwnerId, label, amount, periodicity);
                    return [label, labelId];
                }
            }),
        )) as Array<[string, number]>;

        const labelIdMap = labelsList.reduce((acc, [label, labelId]) => {
            acc[label] = labelId;
            return acc;
        }, {} as Record<string, number>);
        await this.generateGraphs(groupOwnerId, labelIdMap);
    }
}
