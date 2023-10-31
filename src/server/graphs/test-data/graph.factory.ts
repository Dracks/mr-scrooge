import * as Factory from 'factory.ts';

import { GQLGraph, GQLGraphDateRange, GQLGraphGroup, GQLGraphKind } from '../../common/test-graphql/generated';
import { GraphDateRange, GraphGroup, GraphKind } from '../models/graph.model';
import { Graph } from '../services/graph.service';

export const GraphFactory = Factory.Sync.makeFactory<Graph>({
    dateRange: GraphDateRange.halfYear,
    group: {
        group: GraphGroup.Month,
    },
    groupOwnerId: 1,
    id: Factory.Sync.each(id => id),
    kind: GraphKind.Pie,
    name: Factory.Sync.each(name => `name: ${name}`),
});

export const GQLGraphFactory = Factory.Sync.makeFactory<GQLGraph>({
    dateRange: GQLGraphDateRange.HalfYear,
    group: {
        group: GQLGraphGroup.Month,
    },
    groupOwnerId: 1,
    id: Factory.Sync.each(id => id),
    kind: GQLGraphKind.Pie,
    name: Factory.Sync.each(name => `name: ${name}`),
});
