import * as Factory from 'factory.ts';

import { ILabel } from '../models/label.model';

export const labelFactory = Factory.Sync.makeFactory<ILabel>({
    id: Factory.Sync.each(id => id),
    groupOwnerId: 1,
    name: Factory.Sync.each(name => `name: ${name}`),
});
