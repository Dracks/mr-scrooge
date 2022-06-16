import React from 'react';

import { UseAxiosResult } from "axios-hooks";
import { EnrichedGraph, EnrichedGroup, GetGraphsResponse, GetGraphsV2Response, GraphGroup, GraphV2 } from "./types";
import { graphV1V2Mapper } from './graph-v1-v2.mapper';
import { useTagContext } from '../../../contents/common/tag.context';
import { Tag } from '../tag/types';

export const useJoinedGraphs = (graphsV2: UseAxiosResult<GetGraphsV2Response>[0], graphsV1: UseAxiosResult<GetGraphsResponse>[0]): UseAxiosResult<GraphV2[]>[0] => {
    const tags = useTagContext()
    const mappedOldIds = React.useMemo(()=> graphsV2.data && graphsV2.data.map(graph => graph.oldGraph), [graphsV2.data]);
    const oldGraphsMapped = React.useMemo(()=> graphsV1.data && mappedOldIds && graphsV1.data.filter(({id})=>mappedOldIds.indexOf(id)<0).map(graphV1V2Mapper), [graphsV2.data, graphsV1.data]);
    return {
        loading: graphsV2.loading || graphsV1.loading,
        error: graphsV2.error || graphsV1.error,
        data: graphsV2.data && graphsV1.data ? [...graphsV2.data, ...oldGraphsMapped as GraphV2[]] : undefined,
    }
}