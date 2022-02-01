import React from 'react'
import {Route, Routes} from 'react-router'
import {Box, Nav, Sidebar } from 'grommet'
import { AnchorLink } from '../../utils/ui/anchor-link'
import { ImportWizard } from './wizard'
import { ImportDetails } from './details'


export const Imports: React.FC = ()=>{

    return <Box direction='row'>
        <Sidebar 
        background="neutral-2">
            <Nav >
                <Box pad='small'>
                    <AnchorLink  href=''>
                        Wizard
                    </AnchorLink >
                </Box>
                <Box pad='small'>
                    <AnchorLink  href='1'>
                        1
                    </AnchorLink >
                </Box>
            </Nav>
        </Sidebar>
        <Box>
            <Routes>
                <Route path='' element={<ImportWizard />}/>
                <Route path=':id' element={<ImportDetails />} />
            </Routes>
            
        </Box>
    </Box>
}