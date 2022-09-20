import React from 'react'
import { Footer, Text, Main, Box } from 'grommet'
import { Route, Routes } from 'react-router-dom'

import NotFound from './extra/not-found'
import Headers from './headers'
import { RawDataList } from './raw-data-list/raw-data-list'
import { DataProvider } from './common/data-provider'
import { Imports } from './imports/imports'
import { Tags } from './tags/tags'
import { GraphRouter } from './graphs/graph-router'
import { Graphs } from './graphs/graphs'
import { VERSION } from '../constants'

const RestrictedContent: React.FC = () => (
    <DataProvider>
        <Headers />
        <Main>
            <Routes>
                <Route path="" element={<Graphs />} />
                <Route path="/graph/*" element={<GraphRouter />} />
                <Route path="/import/*" element={<Imports />} />
                <Route path="/tag/*" element={<Tags />} />
                <Route path="/movement" element={<RawDataList />} /> 
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Main>

        <Footer background="light-2" pad="medium">
            <Box fill align="center">
                <Text size="small" textAlign="center">
                    Mr Scrooge by Jaume Singla Valls
                </Text>
                <Text size="small" textAlign="center">
                    version {VERSION}
                </Text>
            </Box>
        </Footer>
    </DataProvider>

        
)

export default RestrictedContent;


