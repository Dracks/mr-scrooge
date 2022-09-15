import { DateRange, EnrichedGraph, GraphKind } from "../../api/client/graphs/types";
import {  useRdsData } from "../common/raw-data-source.context"
import { createGroupWithSubGroup } from "./data-transform/create-groups";
import { getRangeFilter, groupLambdas, sortLambdas } from './data-transform/lambdas'
import { sumGroups } from "./data-transform/sum-groups";
import {accumulateFn} from './data-transform/accumulate'
import { useLogger } from "../../utils/logger/logger.context";
import { Tag } from "../../api/client/tag/types";

const hashDateRange : Record<DateRange, number | undefined> = {
    month: 1,
    six: 6,
    year: 12,
    twoYears: 24,
    all: undefined
}

export const useGraphDataGenerator = ({tagFilter, dateRange, horizontalGroup, group, accumulate}: EnrichedGraph) =>{
    const {data} = useRdsData()
    const monthRange = hashDateRange[dateRange as DateRange] 
    let rdsList = tagFilter ? data.filter(rds=> rds.tags.indexOf(tagFilter)>=0) : data
    rdsList = monthRange ? rdsList.filter(getRangeFilter(monthRange, new Date())) : rdsList

    const groupLambda = groupLambdas[group.group](group.groupTags, group.hideOthers ?? false)
    const horizontalGroupLambda = horizontalGroup ? groupLambdas[horizontalGroup.group](horizontalGroup.groupTags, horizontalGroup.hideOthers ?? false) : groupLambdas.identity()

    const rdsGrouped = createGroupWithSubGroup(rdsList, {name: horizontalGroup?.group ?? 'identity', callback: horizontalGroupLambda}, {name: group.group, callback:groupLambda})
    const rdsGroupedSum = sumGroups(rdsGrouped)

    const tagMap = ({name}: Tag)=>name

    const sortLambda = horizontalGroup ? sortLambdas[horizontalGroup.group](horizontalGroup.groupTags.map(tagMap)) :sortLambdas[group.group](group.groupTags.map(tagMap))
    let  rdsSorted = rdsGroupedSum.sort((a,b)=> sortLambda(a.label,b.label))

    if (accumulate){
        rdsSorted = accumulateFn(rdsSorted)
    }

    return rdsSorted
}