import { Injectable } from '@nestjs/common';
import {  isBefore, sub } from 'date-fns';
import { match } from 'ts-pattern';

import { BankTransactionService } from '../server/bank-transaction/bank-transaction.service';
import { DateOnly } from '../server/common/custom-types/date-only';
import { GraphDateRange, GraphGroup, GraphKind } from '../server/graphs/models/graph.model';
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
                const newDate = new Date();
                newDate.setDate(5);
                return newDate;
            })
            .exhaustive();

        const finish = sub(new Date(), { months: 6 });
        finish.setDate(0);

        while (isBefore(finish, date)) {
            // eslint-disable-next-line no-await-in-loop
            const transaction = await this.transactionService.addTransaction({
                date: new DateOnly(date).toString(),
                groupOwnerId,
                kind: 'demo',
                movementName: `transaction ${label}`,
                value: getAmount(),
            });
            // eslint-disable-next-line no-await-in-loop
            await this.labelService.addTransaction({ labelId: labelData.dataValues.id, transactionId: transaction.id });
            date = sub(date, nextFn());
        }
        return labelData.id;
    }

    async generateGraphs(groupOwnerId: number, labelIdMap: Record<string, number>) {
        await this.graphService.createGraph({
            dateRange: GraphDateRange.halfYear,
            group: {
                group: GraphGroup.Sign,
            },
            groupOwnerId,
            horizontalGroup: {
                group: GraphGroup.Month,
            },
            kind: GraphKind.Bar,
            name: 'Income vs expenses',
        });
        await this.graphService.createGraph({
            dateRange: GraphDateRange.twoYears,
            group: {
                group: GraphGroup.Labels,
                labels: [labelIdMap.groceries, labelIdMap.gasoline],
            },
            groupOwnerId,
            horizontalGroup: {
                group: GraphGroup.Month,
            },
            kind: GraphKind.Line,
            name: 'Compare labels',
        });
    }

    async generateAll(groupOwnerId: number) {
        const labelConfigMap: Record<string, { amount: Range; periodicity: 'days' | 'montly' }> = {
            gasoline: { amount: { max: -30, min: -100 }, periodicity: 'days' },
            groceries: {
                amount: { max: -10, min: -100 },
                periodicity: 'days',
            },
            mortgage: {
                amount: { max: -400, min: -400 },
                periodicity: 'montly',
            },
            phone: {
                amount: { max: -10, min: -15 },
                periodicity: 'montly',
            },
            salary: {
                amount: { max: 2100, min: 1800 },
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

                return undefined;
            }),
        )) as Array<[string, number]>;

        const labelIdMap = labelsList.reduce((acc, [label, labelId]) => {
            acc[label] = labelId;
            return acc;
        }, {} as Record<string, number>);
        await this.generateGraphs(groupOwnerId, labelIdMap);
    }
}
