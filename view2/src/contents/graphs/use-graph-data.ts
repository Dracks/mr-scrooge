import { GraphV2 } from "../../api/client/graphs/types";
import {  useRdsData } from "../common/raw-data-source.context"

export const useGraphDataGenerator = (graph: GraphV2) =>{
    const {data} = useRdsData()
    const rdsList = graph.tagFilter ? data.filter(rds=> rds.tags.map(({id})=>id).indexOf(graph.tagFilter)>0) : data
    
    switch (graph.kind){
        case 'bar':
        case 'line':
            return {}
        case 'pie':
    }
}