import * as Factory from 'factory.ts';

import { IBankTransaction } from '../models/bank-transaction.model';

export const BankTransactionFactory = Factory.Sync.makeFactory<IBankTransaction>({
    date: '2022-02-02',
    groupOwnerId: 1,
    id: Factory.Sync.each(id => id),
    kind: 'demo',
    movementName: Factory.Sync.each(id => `movement ${id}`),
    value: Factory.Sync.each(id => id + id / 100),
});
