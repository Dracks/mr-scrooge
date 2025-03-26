import * as Factory from 'factory.ts';

import { UserGroup } from '../../api/models';
import { generateUUID } from './uuid.factory';

export const generateGroupId = (id: number) => generateUUID(id, 'user-group');

export const userGroupFactory = Factory.Sync.makeFactory<UserGroup>({
    id: Factory.each(idx => generateGroupId(idx)),
    name: 'User group',
});

export const mainGroupOwnerId = generateUUID(1, 'group');
