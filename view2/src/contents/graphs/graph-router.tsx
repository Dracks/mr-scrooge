import React from "react"
import { Routes, Route } from "react-router"
import { GraphNew } from "./form/graph-new.form"
import { Graphs } from "./graphs"

export const GraphRouter: React.FC<{}> = ()=>{
    return <Routes>
    <Route path='new-graph' element={<GraphNew />} />
    {/*<Route path=':id' element={<GraphEdit />} />*/}
</Routes> 
}