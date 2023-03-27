import * as Factory from 'factory.ts'

import { GQLLabel } from '../../api/graphql/generated';

export const labelFactory = Factory.Sync.makeFactory<GQLLabel>({
    id: Factory.each(idx => idx),
    name: 'Build tag',
    groupOwnerId: 1
})
