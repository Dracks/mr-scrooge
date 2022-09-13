import React from "react"
import { Routes, Route } from "react-router"
import { useTagsContext } from "../common/tag.context"
import { TagEdit } from "./edit-tag/edit-tag"
import { TagsList } from "./list-tags"

export const Tags : React.FC<{}> = ()=>{
    return  <Routes>
        <Route path='' element={<TagsList />}/>
        <Route path=':id' element={<TagEdit />} />
    </Routes>  
}

/*
export const Tags : React.FC<{}> = ()=>{
    return <Box direction='row'>
         <Sidebar 
        background="neutral-2">
            <Nav >
                <Box pad='small'>
                    <AnchorLink  to=''>
                        New Tag
                    </AnchorLink >
                </Box>
            </Nav>
        </Sidebar>
        <Box fill>

        </Box>
    </Box>
}

*/