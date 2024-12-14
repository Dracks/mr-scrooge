import * as Factory from 'factory.ts';

import { ApiUUID, Label } from '../../api/models';
import { range } from '../range';
import { mainGroupOwnerId } from './user-group.factory';
import { generateUUID } from './uuid.factory';

export const generateLabelId = (id: number) => generateUUID(id, 'label');

export const labelFactory = Factory.Sync.makeFactory<Label>({
    id: Factory.each(idx => generateLabelId(idx)),
    name: 'Build tag',
    groupOwnerId: mainGroupOwnerId,
});

export const listLabelIds: ApiUUID[] = range(0, 10).map(idx => generateLabelId(idx));
