import React from 'react'
import {Route, Routes, useParams} from 'react-router'
import {Box, Nav, Sidebar, Text } from 'grommet'
import { AnchorLink } from '../../utils/ui/anchor-link'
import { ImportWizard } from './wizard/import-wizard'
import { ImportDetails } from './details/details'
import { useGetImports } from '../../api/client/imports/use-get-imports'
import Loading from '../../utils/ui/loading'
import { EventTypes, useEventEmitter } from '../../utils/providers/event-emitter.provider'
import NotFound from '../extra/not-found'
import { StatusReport } from '../../api/client/imports/types'

const ImportDetailsSwitcher : React.FC<{importsList: StatusReport[] }> = ({importsList})=>{
    let {id} = useParams();
    let status = importsList.find((status)=>status.id===Number.parseInt(id ?? 'NaN', 10))

    return status ? <ImportDetails status={status}/> : <NotFound />
}

export const Imports: React.FC = ()=>{
    const [response, request] = useGetImports()
    const eventEmitter = useEventEmitter()
    const importsList = response.data ?? []

    React.useEffect(()=>{
        const unsubscribe = eventEmitter.subscribe(EventTypes.OnFileUploaded, ()=>{
            request()
        })

        return unsubscribe
    })

    return <Box direction='row'>
        <Sidebar 
        background="neutral-2">
            <Nav >
                <Box pad='small'>
                    <AnchorLink  to=''>
                        Wizard
                    </AnchorLink >
                </Box>
                {response.loading ? <Loading /> : importsList.map(impFile => (
                <Box pad='small' key={impFile.id}>
                    <AnchorLink to={`${impFile.id}`}>
                        <Text truncate="tip">{impFile.fileName}</Text>
                    </AnchorLink >
                </Box>))}
            </Nav>
        </Sidebar>
        <Box fill>
            <Routes>
                <Route path='' element={<ImportWizard />}/>
                <Route path=':id' element={<ImportDetailsSwitcher importsList={importsList} />} />
            </Routes>  
        </Box>
    </Box>
}