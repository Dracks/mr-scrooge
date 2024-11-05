import * as Factory from 'factory.ts';

import { GQLLabel, Scalars } from '../../api/graphql/generated';
import { range } from '../range';
import { mainGroupOwnerId } from './user-group.factory';
import { generateUUID } from './uuid.factory';

export const generateLabelId = (id:number) => generateUUID(id, "label")

export const labelFactory = Factory.Sync.makeFactory<GQLLabel>({
    id: Factory.each(idx => generateLabelId(idx)),
    name: 'Build tag',
    groupOwnerId: mainGroupOwnerId,
});

export const listLabelIds : Scalars["UUID"][] = range(0, 10).map(idx=>generateLabelId(idx))
