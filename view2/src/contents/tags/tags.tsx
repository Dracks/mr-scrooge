import { Box, Nav, Sidebar, Text } from "grommet"
import React from "react"
import { Routes, Route } from "react-router"
import { AnchorLink } from "../../utils/ui/anchor-link"
import { TagEdit } from "./edit-tag"
import { NewTag } from "./new-tag"

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
            <Routes>
                <Route path='' element={<NewTag />}/>
                <Route path=':id' element={<TagEdit />} />
            </Routes>  
        </Box>
    </Box>
}