import React from "react"
import { useParams } from "react-router-dom"
import { GraphV2 } from "../../../api/client/graphs/types"
import { useGetGraphV2 } from "../../../api/client/graphs/use-get-graph-v2"
import { usePostGraphsV2 } from "../../../api/client/graphs/use-post-graphs-v2"
import { usePutGraphsV2 } from "../../../api/client/graphs/use-put-graphs-v2"
import { LoadingPage } from "../../../utils/ui/loading"
import { GraphForm, GraphForm } from "./graph.form"

interface GraphEditProps {
    id: number
}
export const GraphEdit : React.FC<GraphEditProps> = ({id})=>{
    const [graph] = useGetGraphV2(id)
    const [, updateGraph] = usePutGraphsV2(id)
    const [graphData, setGraphData] = React.useState<GraphV2>()

    React.useEffect(()=>{
        if (!graph.loading && graph.data){
            setGraphData(graph.data)
        }
    }, [graph.data, id])

    if (graphData){
        return <GraphForm graphData={graphData} update={setGraphData} save={async ()=>{
            await updateGraph({
                data: graphData
            })}}/>
    }
    return <LoadingPage />

}