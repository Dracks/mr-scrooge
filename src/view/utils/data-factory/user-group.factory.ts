import * as Factory from 'factory.ts';

import { GQLGqlUserGroup, GQLLabel, Scalars } from '../../api/graphql/generated';
import { generateUUID } from './uuid.factory';

export const generateGroupId = (id: number) => generateUUID(id, "user-group")

export const userGroupFactory = Factory.Sync.makeFactory<GQLGqlUserGroup>({
    id: Factory.each(idx => generateGroupId(idx)),
    name: 'User group'
})

export const mainGroupOwnerId = generateUUID(1, "group")
