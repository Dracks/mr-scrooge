import * as Factory from 'factory.ts'

import { Tag } from '../../api/client/tag/types';

export const tagFactory = Factory.Sync.makeFactory<Tag>({
    id: Factory.each(idx => idx),
    name: 'Build tag',
    children: [],
    filters: [],
})
