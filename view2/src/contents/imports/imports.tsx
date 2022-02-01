import React from 'react'
import {Route, Routes} from 'react-router'
import {Box, Nav, Sidebar } from 'grommet'
import { AnchorLink } from '../../utils/ui/anchor-link'
import { ImportWizard } from './wizard/import-wizard'
import { ImportDetails } from './details'
import { useGetImports } from '../../api/client/imports/use-get-imports'
import Loading from '../../utils/ui/loading'


export const Imports: React.FC = ()=>{
    const [response] = useGetImports()
    const importsList = response.data ?? []

    return <Box direction='row'>
        <Sidebar 
        background="neutral-2">
            <Nav >
                <Box pad='small'>
                    <AnchorLink  href=''>
                        Wizard
                    </AnchorLink >
                </Box>
                {response.loading ? <Loading /> : importsList.map(impFile => (
                <Box pad='small'>
                    <AnchorLink href={`${impFile.id}`}>
                        1
                    </AnchorLink >
                </Box>))}
            </Nav>
        </Sidebar>
        <Box fill>
            <Routes>
                <Route path='' element={<ImportWizard />}/>
                <Route path=':id' element={<ImportDetails />} />
            </Routes>
            
        </Box>
    </Box>
}