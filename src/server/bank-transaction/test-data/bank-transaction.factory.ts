import * as Factory from 'factory.ts';

import { IBankTransaction } from '../models/bank-transaction.model';

export const BankTransactionFactory = Factory.Sync.makeFactory<IBankTransaction>({
    id: Factory.Sync.each(id => id),
    groupOwnerId: 1,
    date: '2022-02-02',
    value: Factory.Sync.each(id => id + id / 100),
    kind: 'demo',
    movementName: Factory.Sync.each(id => `movement ${id}`),
    pageKey: '',
});
