import React from "react"
import { Routes, Route, useParams } from "react-router"
import NotFound from "../extra/not-found"
import { GraphEdit } from "./form/graph-edit.form"
import { GraphNew } from "./form/graph-new.form"
import { Graphs } from "./graphs"

const EditGraphWithRoute = ()=>{
    const { id } = useParams<{ id: string }>()
    const idNumber = parseInt(id ?? '0', 10)
    if (id && !Number.isNaN(idNumber)){
        return <GraphEdit id={idNumber} />
    } else {
        return <NotFound />
    }
}
export const GraphRouter: React.FC<{}> = ()=>{
    return <Routes>
    <Route path='new-graph' element={<GraphNew />} />
    <Route path=':id' element={<EditGraphWithRoute />} />
</Routes> 
}