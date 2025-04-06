import * as Factory from 'factory.ts';

import { BankTransaction } from "../../api/models";
import { mainGroupOwnerId } from './user-group.factory';
import { generateUUID } from './uuid.factory';

export const generateTransactionId = (id: number) => generateUUID(id, 'label');

export const transactionFactory = Factory.Sync.makeFactory<BankTransaction>({
    id: Factory.each(idx => generateTransactionId(idx)),
    groupOwnerId: mainGroupOwnerId,
    movementName: Factory.each(idx => `Movement ${String(idx)}`),
    date: Factory.each(() => new Date().toISOString().split('T')[0] as string),
    dateValue: Factory.each(() => new Date().toISOString().split('T')[0]),
    details: 'Sample transaction details',
    value: 100.50,
    kind: 'Test',
    comment: 'Sample comment',
    labelIds: []
})