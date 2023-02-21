import * as Factory from "factory.ts";
import { GraphGroup, GraphKind } from "../models/graph.model";
import { Graph } from "../services/graph.service";

export const GraphFactory = Factory.Sync.makeFactory<Graph>({
    id: Factory.Sync.each(id => id),
    groupOwnerId: 1,
    kind: GraphKind.Pie,
    name: Factory.Sync.each(name => `name: ${name}`),
    dateRange: '6 months',
    group: {
        group: GraphGroup.Month
    }
})